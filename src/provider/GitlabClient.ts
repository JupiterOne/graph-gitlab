import fetch, { RequestInit, Response } from 'node-fetch';

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  created_at: string;
}

export interface GitLabUserRef {
  id: number;
  name: string;
  username: string;
  state: string;
  access_level: number;
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
  owner?: {
    id: number;
    name: string;
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
  private readonly baseUrl: string;
  private readonly personalToken: string;

  constructor(baseUrl: string, personalToken: string) {
    this.baseUrl = baseUrl;
    this.personalToken = personalToken;
  }

  async fetchAccount(): Promise<GitLabUser> {
    return this.makeRequest(HttpMethod.GET, '/user');
  }

  async fetchGroups(): Promise<GitLabGroup[]> {
    return this.makeRequest(HttpMethod.GET, '/groups');
  }

  async fetchProjects(): Promise<GitLabProject[]> {
    return this.makeRequest(HttpMethod.GET, '/projects');
  }

  async fetchUsers(): Promise<GitLabUser[]> {
    return this.makeRequest(HttpMethod.GET, '/users');
  }

  async fetchProjectMergeRequests(
    projectId: number,
  ): Promise<GitLabMergeRequest[]> {
    return this.makeRequest(
      HttpMethod.GET,
      `/projects/${projectId}/merge_requests`,
    );
  }

  async fetchProjectMembers(projectId: number): Promise<GitLabUserRef[]> {
    return this.makeRequest(
      HttpMethod.GET,
      `/projects/${projectId}/members/all`,
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
