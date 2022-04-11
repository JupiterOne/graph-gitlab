import {
  IntegrationInstance,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';

import { GitlabIntegrationConfig } from '../types';
import { GitlabClient } from './GitlabClient';

type GitlabClientConfig = {
  baseUrl: string;
  personalToken: string;
};

let client: GitlabClient;
export function createGitlabClient(
  config: GitlabClientConfig,
  logger: IntegrationLogger,
): GitlabClient {
  if (!client) {
    client = new GitlabClient(config.baseUrl, config.personalToken, logger);
  }
  return client;
}

export type ClientCreator = (
  client: IntegrationInstance<GitlabIntegrationConfig>,
  logger: IntegrationLogger,
) => GitlabClient;
