import fetch, { Response } from 'node-fetch';
import { URLSearchParams } from 'url';
import { retry, sleep } from '@lifeomic/attempt';

import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

import {
  GitLabFinding,
  GitLabGroup,
  GitLabMergeRequest,
  GitLabMergeRequestApproval,
  GitLabProject,
  GitLabUser,
  GitLabUserRef,
  GitlabLabel,
  GitLabVersion,
} from './types';

/**
 * default: 20, max: 100
 */
const ITEMS_PER_PAGE = 100;

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;
export type PageErrorHandler = (handlerArgs: {
  err: Error;
  endpoint: string;
}) => Promise<void> | void;

export type RateLimitStatus = {
  limit: number;
  remaining: number;
  resetAtMillis: number;
};

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

export class GitlabClient {
  private readonly baseUrl: string;
  private readonly personalToken: string;
  private readonly logger: IntegrationLogger;
  private rateLimitStatus: RateLimitStatus;

  constructor(
    baseUrl: string,
    personalToken: string,
    logger: IntegrationLogger,
  ) {
    this.baseUrl = baseUrl;
    this.personalToken = personalToken;
    this.logger = logger;
  }
  // https://docs.gitlab.com/ee/api/projects.html#list-all-projects
  // Acording to this, we can call this endpoint without a private-token to access only the public projects
  // This would allow us to have a better way to test if the Base URL provided by the user is invalid.
  async isValidUrl() {
    const endpoint = `${this.baseUrl}/api/v4/projects`;
    await fetch(endpoint, {
      method: HttpMethod.GET,
      headers: {
        'Private-Token': '',
      },
    });
  }

  async fetchTokenOwner(): Promise<GitLabUser> {
    return this.makeSingularRequest(HttpMethod.GET, '/user');
  }

  async fetchSystemVersion(): Promise<GitLabVersion> {
    return this.makeSingularRequest(HttpMethod.GET, '/version');
  }

  async fetchUser(id: number): Promise<GitLabUser> {
    return this.makeSingularRequest(HttpMethod.GET, `/users/${id}`);
  }

  async fetchGroups(): Promise<GitLabGroup[]> {
    return this.makePaginatedRequest(HttpMethod.GET, '/groups');
  }

  async iterateProjectVulnerabilities(
    projectId: string,
    iteratee: ResourceIteratee<GitLabFinding>,
  ): Promise<void> {
    return this.iterateResources(
      `/projects/${projectId}/vulnerability_findings`,
      iteratee,
      {
        params: { severity: ['medium', 'high', 'critical'] },
      },
    );
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

  async iterateProjectMergeRequests(
    projectId: number,
    iteratee: ResourceIteratee<GitLabMergeRequest>,
    options: {
      updatedAfter: Date;
      onPageError: PageErrorHandler;
    },
  ): Promise<void> {
    return this.iterateResources(
      `/projects/${projectId}/merge_requests`,
      iteratee,
      {
        onPageError: options.onPageError,
        params: { updated_after: options.updatedAfter.toISOString() },
      },
    );
  }

  async iterateMergeRequestCommits(
    projectId: number,
    mergeRequestNumber: number,
    iteratee: ResourceIteratee<GitLabMergeRequest>,
    options: {
      onPageError: PageErrorHandler;
    },
  ): Promise<void> {
    return this.iterateResources(
      `/projects/${projectId}/merge_requests/${mergeRequestNumber}/commits`,
      iteratee,
      {
        onPageError: options.onPageError,
      },
    );
  }

  async iterateProjectLabels(
    projectId: number,
    iteratee: ResourceIteratee<GitlabLabel>,
  ) {
    return this.iterateResources(`/projects/${projectId}/labels`, iteratee, {
      params: {
        with_counts: 'true',
      },
    });
  }

  /**
   * https://docs.gitlab.com/ee/api/merge_request_approvals.html#get-configuration-1
   */
  async fetchMergeRequestApprovals(
    projectId: number,
    mergeRequestId: number,
  ): Promise<GitLabMergeRequestApproval> {
    return this.makeSingularRequest(
      HttpMethod.GET,
      `/projects/${projectId}/merge_requests/${mergeRequestId}/approvals`,
    );
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

    /**
     *  This function is repeated if an error occurs.
     */
    const requestAttempt = async () => {
      await this.checkRateLimitStatus();

      const response: Response = await fetch(endpoint, {
        method,
        headers: {
          'Private-Token': this.personalToken,
        },
      });

      this.setRateLimitStatus(response);

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
    };

    return await retry(requestAttempt, {
      maxAttempts: 3,
      delay: 30_000,
      timeout: 180_000,
      factor: 2,
      handleError: (error, attemptContext) => {
        if ([401, 403, 404].includes(error.status)) {
          attemptContext.abort();
        }

        if (attemptContext.aborted) {
          this.logger.warn(
            { attemptContext, error, endpoint },
            'Hit an unrecoverable error from API Provider. Aborting.',
          );
        } else {
          this.logger.warn(
            { attemptContext, error, endpoint },
            `Hit a possibly recoverable error from API Provider. Waiting before trying again.`,
          );
        }
      },
    });
  }

  /**
   * Pulls rate limit headers from response.
   * Docs here: https://docs.gitlab.com/ee/user/admin_area/settings/user_and_ip_rate_limits.html#response-headers
   * @param response
   * @private
   */
  private setRateLimitStatus(response: Response) {
    const limit = response.headers.get('RateLimit-Limit');
    const remaining = response.headers.get('RateLimit-Remaining');
    const resetAt = response.headers.get('RateLimit-Reset');

    if (limit && remaining && resetAt) {
      this.rateLimitStatus = {
        limit: Number(limit),
        remaining: Number(remaining),
        resetAtMillis: Number(resetAt) * 1000, // Convert from seconds to milliseconds.
      };
    }

    this.logger.info(this.rateLimitStatus, 'Rate limit status.');
  }

  /**
   * Determines if approaching the rate limit, sleeps until rate limit has reset.
   */
  private async checkRateLimitStatus() {
    if (this.rateLimitStatus) {
      const rateLimitRemainingProportion =
        this.rateLimitStatus.remaining / this.rateLimitStatus.limit;
      const msUntilRateLimitReset =
        this.rateLimitStatus.resetAtMillis - Date.now();

      if (rateLimitRemainingProportion <= 0.1 && msUntilRateLimitReset > 0) {
        this.logger.info(
          {
            rateLimitStatus: this.rateLimitStatus,
            msUntilRateLimitReset,
            rateLimitRemainingProportion,
          },
          `Reached rate limits, sleeping now.`,
        );
        await sleep(msUntilRateLimitReset);
      }
    }
  }

  private async makeSingularRequest<T>(
    method: HttpMethod,
    url: string,
  ): Promise<T> {
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
