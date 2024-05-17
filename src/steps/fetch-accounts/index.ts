import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';
import { Entities, Steps } from '../../constants';
import { createAccountEntity } from '../../converters';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: Steps.ACCOUNTS,
  name: 'Fetch accounts',
  entities: [Entities.ACCOUNT],
  relationships: [],
  async executionHandler({
    instance,
    jobState,
    logger,
  }: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
    const client = createGitlabClient(instance.config, logger);
    const systemVersion = await client.fetchSystemVersion();
    const tokenOwner = await client.fetchTokenOwner();

    await jobState.addEntity(createAccountEntity(tokenOwner, systemVersion));
  },
};

export default step;
