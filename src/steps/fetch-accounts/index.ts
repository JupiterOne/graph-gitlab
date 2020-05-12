import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../../provider';
import { GitLabUser } from '../../provider/types';

export const STEP_ID = 'fetch-accounts';
export const ACCOUNT_TYPE = 'gitlab_account';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch accounts',
  types: [ACCOUNT_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const account = await client.fetchAccount();

    await jobState.addEntities([createAccountEntity(account)]);
  },
};

export function createAccountEntity(user: GitLabUser): Entity {
  const id = createAccountEntityIdentifier(user.id);

  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _key: id,
        _type: ACCOUNT_TYPE,
        _class: 'User',

        id,
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
