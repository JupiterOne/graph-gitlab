import {
  IntegrationExecutionContext,
  IntegrationInstance,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from './provider/index';
import { GitlabIntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<GitlabIntegrationConfig>,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context.instance)) {
    context.logger.info('Integration instance is valid!');
  } else {
    throw new Error('Failed to authenticate with provided credentials');
  }
}

async function isConfigurationValid(
  instance: IntegrationInstance<GitlabIntegrationConfig>,
): Promise<boolean> {
  try {
    const client = createGitlabClient(instance);
    await client.fetchAccount();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
