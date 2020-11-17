import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { GitLabUser } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';
import { Entities, Steps } from '../../constants';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: Steps.ACCOUNTS,
  name: 'Fetch accounts',
  entities: [Entities.ACCOUNT],
  relationships: [],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
    const client = createGitlabClient(instance.config);
    const account = await client.fetchAccount();

    await jobState.addEntities([createAccountEntity(account)]);
  },
};

export function createAccountEntity(user: GitLabUser): Entity {
  const key = createAccountEntityIdentifier(user.id);

  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _key: key,
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,

        id: user.id.toString(),
        name: user.name,
        createdOn: new Date(user.created_at).getTime(),
      },
    },
  });
}

const ACCOUNT_ID_PREFIX = 'gitlab-account';
export function createAccountEntityIdentifier(id: number): string {
  return `${ACCOUNT_ID_PREFIX}:${id}`;
}

export default step;
