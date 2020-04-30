import fetch, { RequestInit, Response } from 'node-fetch';

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  created_at: string;
}

export interface GitLabGroup {
  id: number;
  parent_id: number | null;
  name: string;
  web_url: string;
  created_at: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  namespace: {
    id: number;
    parent_id: number;
    kind: string;
  };
  created_at: string;
}

export interface GitLabMergeRequest {
  id: number;
  project_id: number;
  title: string;
  state: string;
  source_branch: string;
  target_branch: string;
  description: string;
  created_at: string;
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

export class GitlabClient {
  private readonly baseUrl: string = 'https://gitlab.com';
  private readonly personalToken: string;

  constructor(personalToken: string) {
    this.personalToken = personalToken;
  }

  async fetchAccount(): Promise<GitLabUser> {
    return this.makeRequest(HttpMethod.GET, '/user');
  }

  async fetchGroups(): Promise<GitLabGroup[]> {
    return this.makeRequest(HttpMethod.GET, '/groups');
  }

  async fetchProjects(): Promise<GitLabProject[]> {
    return this.makeRequest(HttpMethod.GET, '/projects?owned=true');
  }

  async fetchProjectMergeRequests(
    projectId: number,
  ): Promise<GitLabMergeRequest[]> {
    return this.makeRequest(
      HttpMethod.GET,
      `/projects/${projectId}/merge_requests`,
    );
  }

  private async makeRequest<T>(method: HttpMethod, url: string): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Private-Token': this.personalToken,
      },
    };

    const response: Response = await fetch(
      `${this.baseUrl}/api/v4${url}`,
      options,
    );

    if (!response) {
      throw new Error(`No response from '${this.baseUrl}/api/v4${url}'`);
    }

    const responseBody: string = await response.text();
    return responseBody.length > 0 ? JSON.parse(responseBody) : {};
  }
}
