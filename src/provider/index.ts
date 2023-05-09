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

let client: GitlabClient | undefined;
export function createGitlabClient(
  config: GitlabClientConfig,
  logger: IntegrationLogger,
): GitlabClient {
  if (!client) {
    client = new GitlabClient(config.baseUrl, config.personalToken, logger);
  }
  return client;
}
//I added this to test validateInvocation sincee creteGitlabClient
// closely resembles a singleton, and we want to test multiple client
// configs
export function resetClient() {
  client = undefined;
}

export type ClientCreator = (
  client: IntegrationInstance<GitlabIntegrationConfig>,
  logger: IntegrationLogger,
) => GitlabClient;
