import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from './provider/index';
import { GitlabIntegrationConfig } from './types';

export default async function validateInvocation({
  instance,
}: IntegrationExecutionContext<GitlabIntegrationConfig>): Promise<void> {
  const config = instance.config;

  if (!config.baseUrl || !config.personalToken) {
    throw new IntegrationValidationError(
      'Integration configuration requires all of {baseUrl, personalToken}',
    );
  }

  const client = createGitlabClient(instance);
  await client.fetchAccount();
}
