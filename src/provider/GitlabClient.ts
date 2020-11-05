import fetch, { Response } from 'node-fetch';

import {
  IntegrationProviderAPIError,
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

  async fetchProjects(): Promise<GitLabProject[]> {
    return this.makePaginatedRequest(HttpMethod.GET, '/projects', undefined, {
      owned: true,
    });
  }

  async fetchUsers(): Promise<GitLabUser[]> {
    return this.makePaginatedRequest(HttpMethod.GET, '/users');
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

  async fetchGroupProjects(groupId: number): Promise<GitLabProject[]> {
    return this.makePaginatedRequest(
      HttpMethod.GET,
      `/groups/${groupId}/projects`,
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

    if ([401, 403].includes(response.status)) {
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
        `${url}?page=${++page}&per_page=100${
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
