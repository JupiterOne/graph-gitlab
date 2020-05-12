import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as ACCOUNT_STEP, ACCOUNT_TYPE } from './fetch-accounts';
import { STEP_ID as GROUP_STEP, GROUP_TYPE } from './fetch-groups';

const step: IntegrationStep = {
  id: 'build-account-group-relationships',
  name: 'Build account group relationships',
  types: ['gitlab_account_has_group'],
  dependsOn: [ACCOUNT_STEP, GROUP_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const account = await getAccountEntity(jobState);

    await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
      await jobState.addRelationships([
        createAccountGroupRelationship(account, group),
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

export function createAccountGroupRelationship(
  account: Entity,
  group: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: account,
    to: group,
  });
}
