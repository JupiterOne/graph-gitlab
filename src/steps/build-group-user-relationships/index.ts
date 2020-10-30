import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient, ClientCreator } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';
import { Entities, Steps, Relationships } from '../../constants';

export function createStep(
  clientCreator: ClientCreator,
): IntegrationStep<GitlabIntegrationConfig> {
  return {
    id: Steps.BUILD_GROUP_HAS_USER,
    name: 'Build group user relationships',
    entities: [],
    relationships: [Relationships.GROUP_HAS_USER],
    dependsOn: [Steps.GROUPS, Steps.USERS],
    async executionHandler({
      jobState,
      instance,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<
      void
    > {
      const client = clientCreator(instance);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.GROUP._type },
        async (group) => {
          const groupMembers = await client.fetchGroupMembers(
            parseInt(group.id as string, 10),
          );

          if (groupMembers.length > 0) {
            await jobState.addRelationships(
              groupMembers.map((member) =>
                createGroupUserRelationship(
                  group,
                  userIdMap.get(member.id.toString()) as Entity,
                ),
              ),
            );
          }
        },
      );
    },
  };
}

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: Entities.USER._type }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default createStep((instance) => createGitlabClient(instance));

export function createGroupUserRelationship(
  group: Entity,
  user: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: group,
    to: user,
  });
}
