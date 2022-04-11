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

export function createGitlabClient(
  config: GitlabClientConfig,
  logger: IntegrationLogger,
): GitlabClient {
  return new GitlabClient(config.baseUrl, config.personalToken, logger);
}

export type ClientCreator = (
  client: IntegrationInstance<GitlabIntegrationConfig>,
  logger: IntegrationLogger,
) => GitlabClient;
