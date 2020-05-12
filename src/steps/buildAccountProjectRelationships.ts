import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as ACCOUNT_STEP, ACCOUNT_TYPE } from './fetch-accounts';
import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from './fetch-projects';

const step: IntegrationStep = {
  id: 'build-account-project-relationships',
  name: 'Build account project relationships',
  types: ['gitlab_account_has_project'],
  dependsOn: [ACCOUNT_STEP, PROJECT_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const account = await getAccountEntity(jobState);

    await jobState.iterateEntities({ _type: PROJECT_TYPE }, async (project) => {
      await jobState.addRelationships([
        createAccountProjectRelationship(account, project),
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

export function createAccountProjectRelationship(
  account: Entity,
  project: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: account,
    to: project,
  });
}
