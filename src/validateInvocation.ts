import {
  IntegrationExecutionContext,
  IntegrationInstance,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from './provider/index';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
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
  instance: IntegrationInstance,
): Promise<boolean> {
  try {
    const client = createGitlabClient(instance);
    await client.fetchAccount();
    return true;
  } catch (err) {
    return false;
  }
}
