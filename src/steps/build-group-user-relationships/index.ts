import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../../constants';
import { ClientCreator, createGitlabClient } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';

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
      logger,
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

          const groupMemberRelationshipKeys = new Set<string>();

          for (const member of groupMembers) {
            const groupMemberRelationship = createGroupUserRelationship(
              group,
              userIdMap.get(member.id.toString()) as Entity,
            );

            if (groupMemberRelationshipKeys.has(groupMemberRelationship._key)) {
              logger.info(
                { _key: groupMemberRelationship._key },
                '[SKIP] Duplicate group member relationship',
              );
              continue;
            }

            groupMemberRelationshipKeys.add(groupMemberRelationship._key);
            await jobState.addRelationship(groupMemberRelationship);
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

export default createStep((instance) => createGitlabClient(instance.config));

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
