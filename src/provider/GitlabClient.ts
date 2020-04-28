import fetch, { RequestInit, Response } from 'node-fetch';

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
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

  async getAccount(): Promise<GitLabUser> {
    return this.makeRequest(HttpMethod.GET, 'user');
  }

  private async makeRequest<T>(method: HttpMethod, url: string): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Private-Token': this.personalToken,
      },
    };

    const response: Response = await fetch(
      `${this.baseUrl}/api/v4/${url}`,
      options,
    );

    if (!response) {
      throw new Error(`No response from '${this.baseUrl}/api/v4/${url}'`);
    }

    const responseBody: string = await response.text();
    return responseBody.length > 0 ? JSON.parse(responseBody) : {};
  }
}
