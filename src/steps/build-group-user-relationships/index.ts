import {
  createDirectRelationship,
  Entity,
  IntegrationProviderAPIError,
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
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<void> {
      const client = clientCreator(instance, logger);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.GROUP._type },
        async (group) => {
          try {
            const groupMembers = await client.fetchGroupMembers(
              parseInt(group.id as string, 10),
            );

            const groupMemberRelationshipKeys = new Set<string>();

            for (const member of groupMembers) {
              const userEntity: Entity | undefined = userIdMap.get(
                member.id.toString(),
              );
              if (userEntity === undefined) {
                logger.warn(
                  { _id: member.id.toString() },
                  'No user entity found for member ID',
                );
                continue;
              }
              const groupMemberRelationship = createGroupUserRelationship(
                group,
                userEntity,
              );

              if (
                groupMemberRelationshipKeys.has(groupMemberRelationship._key)
              ) {
                logger.info(
                  { _key: groupMemberRelationship._key },
                  '[SKIP] Duplicate group member relationship',
                );
                continue;
              }

              groupMemberRelationshipKeys.add(groupMemberRelationship._key);
              await jobState.addRelationship(groupMemberRelationship);
            }
          } catch (e) {
            if (e.status === 403) {
              logger.warn(
                { _id: group.id?.toString() },
                `User does not have permission to fetch members of group ${group.id}. Please ensure this user has the right access type.`,
              );
            } else {
              throw new IntegrationProviderAPIError({
                endpoint: e.endpoint,
                status: e.status,
                statusText: e.statusText,
              });
            }
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

export default createStep((instance, logger) =>
  createGitlabClient(instance.config, logger),
);

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
