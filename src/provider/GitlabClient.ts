import fetch, { Response } from 'node-fetch';
import { URLSearchParams } from 'url';

import {
  IntegrationError,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

import {
  GitLabGroup,
  GitLabMergeRequest,
  GitLabMergeRequestApproval,
  GitLabProject,
  GitLabUser,
  GitLabUserRef,
} from './types';

/**
 * default: 20, max: 100
 */
const ITEMS_PER_PAGE = 100;

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;
export type PageErrorHandler = ({
  err: Error,
  endpoint: string,
}) => Promise<void> | void;

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

export class GitlabClient {
  private readonly baseUrl: string;
  private readonly personalToken: string;
  private readonly lastRun: Date;

  constructor(baseUrl: string, personalToken: string, lastRun: Date) {
    this.baseUrl = baseUrl;
    this.personalToken = personalToken;
    this.lastRun = lastRun;
  }

  async fetchAccount(): Promise<GitLabUser> {
    return this.makeSingularRequest(HttpMethod.GET, '/user') as Promise<
      GitLabUser
    >;
  }

  async fetchUser(id: number): Promise<GitLabUser> {
    return this.makeSingularRequest(HttpMethod.GET, `/users/${id}`) as Promise<
      GitLabUser
    >;
  }

  async fetchGroups(): Promise<GitLabGroup[]> {
    return this.makePaginatedRequest(HttpMethod.GET, '/groups');
  }

  async iterateOwnedProjects(
    iteratee: ResourceIteratee<GitLabProject>,
  ): Promise<void> {
    return this.iterateResources(`/projects`, iteratee, {
      params: { owned: 'true' },
    });
  }

  async iterateGroupProjects(
    groupId: number,
    iteratee: ResourceIteratee<GitLabProject>,
  ): Promise<void> {
    return this.iterateResources(`/groups/${groupId}/projects`, iteratee);
  }

  async fetchUsers(): Promise<GitLabUser[]> {
    return this.makePaginatedRequest(HttpMethod.GET, '/users');
  }

  async iterateProjectMergeRequests(
    projectId: number,
    iteratee: ResourceIteratee<GitLabMergeRequest>,
    onPageError: PageErrorHandler,
  ): Promise<void> {
    return this.iterateResources(
      `/projects/${projectId}/merge_requests`,
      iteratee,
      {
        onPageError,
        params: { updated_after: this.lastRun.toISOString() },
      },
    );
  }

  async fetchProjectMergeRequests(
    projectId: number,
  ): Promise<GitLabMergeRequest[]> {
    return this.makePaginatedRequest(
      HttpMethod.GET,
      `/projects/${projectId}/merge_requests`,
      1,
      {
        updated_after: this.lastRun.toISOString(),
      },
    );
  }

  async fetchMergeRequestApprovals(
    projectId: number,
    mergeRequestId: number,
  ): Promise<GitLabMergeRequestApproval> {
    try {
      const result = (await this.makeSingularRequest(
        HttpMethod.GET,
        `/projects/${projectId}/merge_requests/${mergeRequestId}/approvals`,
      )) as GitLabMergeRequestApproval;

      return result;
    } catch (err) {
      console.error(err);

      return {} as GitLabMergeRequestApproval;
    }
  }

  async fetchProjectMembers(projectId: number): Promise<GitLabUserRef[]> {
    return this.makePaginatedRequest(
      HttpMethod.GET,
      `/projects/${projectId}/members/all`,
    );
  }

  async fetchGroupMembers(groupId: number): Promise<GitLabUserRef[]> {
    return this.makePaginatedRequest(
      HttpMethod.GET,
      `/groups/${groupId}/members/all`,
    );
  }

  async fetchGroupSubgroups(groupId: number): Promise<GitLabGroup[]> {
    return this.makePaginatedRequest(
      HttpMethod.GET,
      `/groups/${groupId}/subgroups`,
    );
  }

  private async makeRequest(
    method: HttpMethod,
    url: string,
  ): Promise<Response> {
    const endpoint = `${this.baseUrl}/api/v4${url}`;

    const response: Response = await fetch(endpoint, {
      method,
      headers: {
        'Private-Token': this.personalToken,
      },
    });

    if (response.status === 401) {
      throw new IntegrationProviderAuthenticationError({
        endpoint,
        status: response.status,
        statusText: response.statusText,
      });
    } else if (response.status === 403) {
      throw new IntegrationProviderAuthorizationError({
        endpoint,
        status: response.status,
        statusText: response.statusText,
      });
    } else if (!response.ok) {
      throw new IntegrationProviderAPIError({
        endpoint,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  }

  private async makeSingularRequest<T>(
    method: HttpMethod,
    url: string,
  ): Promise<T | null> {
    const response = await this.makeRequest(method, `${url}`);

    return response.json();
  }

  private async iterateResources<T>(
    v4path: string,
    iteratee: ResourceIteratee<T>,
    options?: {
      onPageError?: PageErrorHandler;
      params?: NodeJS.Dict<string | string[]>;
    },
  ): Promise<void> {
    let page = 1;

    do {
      const searchParams = new URLSearchParams({
        ...options?.params,
        page: String(page),
        per_page: String(ITEMS_PER_PAGE),
      });

      const endpoint = `${v4path}?${searchParams.toString()}`;

      let response: Response | undefined;
      try {
        response = await this.makeRequest(HttpMethod.GET, endpoint);
      } catch (err) {
        if (options?.onPageError) {
          await options.onPageError({ err, endpoint });
        } else {
          throw err;
        }
      }

      if (response) {
        page = Number(response.headers.get('x-next-page'));
        const result = await response.json();
        if (Array.isArray(result)) {
          for (const resource of result) {
            await iteratee(resource);
          }
        } else {
          throw new IntegrationError({
            code: 'UNEXPECTED_RESPONSE_DATA',
            message: `Expected a collection of resources but type was ${typeof result}`,
          });
        }
      } else {
        page = 0; // stop pagination, no page info without response
      }
    } while (page);
  }

  // TODO: Get rid of this, improve/use iterateResources
  private async makePaginatedRequest<T>(
    method: HttpMethod,
    url: string,
    maxPages?: number,
    params?: {},
  ): Promise<T[]> {
    const results: T[] = [];
    let page = 0;
    let totalPages = 1;
    const pageLimit = maxPages || Number.POSITIVE_INFINITY;

    do {
      const queryParams = Object.entries(params || {})
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      const response = await this.makeRequest(
        method,
        `${url}?page=${++page}&per_page=${ITEMS_PER_PAGE}${
          queryParams ? '&' + queryParams : ''
        }`,
      );

      totalPages = parseInt(
        response.headers.get('X-Total-Pages') as string,
        10,
      );

      const result = await response.json();

      if (result) {
        results.push(result);
      }
    } while (page < totalPages && page < pageLimit);

    const pageResults: T[] = [];

    return pageResults.concat(...results);
  }
}
