import { IntegrationInstance } from '@jupiterone/integration-sdk-core';

import { GitlabIntegrationConfig } from '../types';
import { GitlabClient } from './GitlabClient';

type GitlabClientConfig = {
  baseUrl: string;
  personalToken: string;
};

export function createGitlabClient(config: GitlabClientConfig): GitlabClient {
  return new GitlabClient(config.baseUrl, config.personalToken);
}

export type ClientCreator = (
  client: IntegrationInstance<GitlabIntegrationConfig>,
) => GitlabClient;
