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
  id: Steps.BUILD_ACCOUNT_HAS_GROUP,
  name: 'Build account group relationships',
  entities: [],
  relationships: [Relationships.ACCOUNT_HAS_GROUP],
  dependsOn: [Steps.ACCOUNTS, Steps.GROUPS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const account = await getAccountEntity(jobState);

    await jobState.iterateEntities(
      { _type: Entities.GROUP._type },
      async (group) => {
        await jobState.addRelationships([
          createAccountGroupRelationship(account, group),
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

export function createAccountGroupRelationship(
  account: Entity,
  group: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: account,
    to: group,
  });
}
