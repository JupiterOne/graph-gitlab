import { IntegrationExecutionContext } from '@jupiterone/integration-sdk';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context.instance.config)) {
    context.logger.info('Integration instance is valid!');
  } else {
    throw new Error('Failed to authenticate with provided credentials');
  }
}

async function isConfigurationValid(config: any): Promise<boolean> {
  // add your own validation logic to ensure you
  // can hit the provider's apis.
  return config.personalToken;
}
