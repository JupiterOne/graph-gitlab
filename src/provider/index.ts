import { IntegrationInstance } from '@jupiterone/integration-sdk-core';
import { GitlabClient } from './GitlabClient';
import { GitlabIntegrationConfig } from '../types';

export function createGitlabClient(
  instance: IntegrationInstance<GitlabIntegrationConfig>,
): GitlabClient {
  const baseUrl = instance.config?.baseUrl;
  const personalToken = instance.config?.personalToken;
  const lastRun = instance.config?.lastRun;

  if (!personalToken || !baseUrl) {
    throw new Error(
      'Configuration options [personalToken, baseUrl] are required for the integration instance config',
    );
  }

  const d = new Date();
  d.setDate(d.getDate() - 7);

  return new GitlabClient(baseUrl, personalToken, lastRun || d);
}

export type ClientCreator = (
  client: IntegrationInstance<GitlabIntegrationConfig>,
) => GitlabClient;
