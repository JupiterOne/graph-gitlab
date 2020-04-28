import { IntegrationInstance } from '@jupiterone/integration-sdk';
import { GitlabClient } from './GitlabClient';

export function createGitlabClient(
  instance: IntegrationInstance,
): GitlabClient {
  const apiKey = instance.config?.personalToken;

  if (!apiKey) {
    throw new Error(
      'Configuration option "apiKey" is missing on the integration instance config',
    );
  }

  return new GitlabClient(instance.config?.personalToken);
}
