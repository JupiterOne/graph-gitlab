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
  id: Steps.BUILD_USER_OPENED_PR,
  name: 'Build user opened merge_request relationships',
  entities: [],
  relationships: [Relationships.USER_OPENED_PR],
  dependsOn: [Steps.MERGE_REQUESTS, Steps.USERS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const userIdMap = await createUserIdMap(jobState);

    await jobState.iterateEntities(
      { _type: Entities.MERGE_REQUEST._type },
      async (mergeRequest) => {
        const openedUser = userIdMap.get(mergeRequest.authorId as string);

        if (openedUser) {
          await jobState.addRelationships([
            createUserOpenedPrRelationship(openedUser, mergeRequest),
          ]);
        }
      },
    );
  },
};

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: Entities.USER._type }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default step;

export function createUserOpenedPrRelationship(
  user: Entity,
  mergeRequest: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.OPENED,
    from: user,
    to: mergeRequest,
  });
}
