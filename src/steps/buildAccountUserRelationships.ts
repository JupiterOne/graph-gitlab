import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as ACCOUNT_STEP, ACCOUNT_TYPE } from './fetchAccounts';
import { STEP_ID as USER_STEP, USER_TYPE } from './fetchUsers';

const step: IntegrationStep = {
  id: 'build-account-user-relationships',
  name: 'Build account user relationships',
  types: ['gitlab_account_manages_user'],
  dependsOn: [ACCOUNT_STEP, USER_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const account = await getAccountEntity(jobState);

    await jobState.iterateEntities({ _type: USER_TYPE }, async (user) => {
      await jobState.addRelationships([
        createAccountUserRelationship(account, user),
      ]);
    });
  },
};

async function getAccountEntity(jobState: JobState): Promise<Entity> {
  return new Promise((resolve, reject) => {
    jobState
      .iterateEntities({ _type: ACCOUNT_TYPE }, (account) => resolve(account))
      .catch((error) => reject(error));
  });
}

export default step;

export function createAccountUserRelationship(
  account: Entity,
  user: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'MANAGES',
    from: account,
    to: user,
  });
}
