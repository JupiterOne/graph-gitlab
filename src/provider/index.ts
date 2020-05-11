import { IntegrationInstance } from '@jupiterone/integration-sdk';
import { GitlabClient } from './GitlabClient';

export function createGitlabClient(
  instance: IntegrationInstance,
): GitlabClient {
  const baseUrl = instance.config?.baseUrl;
  const personalToken = instance.config?.personalToken;

  if (!personalToken || !baseUrl) {
    throw new Error(
      'Configuration options [personalToken, baseUrl] are required for the integration instance config',
    );
  }

  return new GitlabClient(baseUrl, personalToken);
}

export type ClientCreator = (client: IntegrationInstance) => GitlabClient;
