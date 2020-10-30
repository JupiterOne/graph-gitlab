import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Steps, Entities, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.BUILD_ACCOUNT_HAS_PROJECT,
  name: 'Build account project relationships',
  entities: [],
  relationships: [Relationships.ACCOUNT_HAS_PROJECT],
  dependsOn: [Steps.ACCOUNTS, Steps.PROJECTS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const account = await getAccountEntity(jobState);

    await jobState.iterateEntities(
      { _type: Entities.PROJECT._type },
      async (project) => {
        await jobState.addRelationships([
          createAccountProjectRelationship(account, project),
        ]);
      },
    );
  },
};

async function getAccountEntity(jobState: JobState): Promise<Entity> {
  return new Promise((resolve, reject) => {
    jobState
      .iterateEntities({ _type: Entities.ACCOUNT._type }, (account) =>
        resolve(account),
      )
      .catch((error) => reject(error));
  });
}

export default step;

export function createAccountProjectRelationship(
  account: Entity,
  project: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: account,
    to: project,
  });
}
