import {
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { GitlabIntegrationConfig } from '../../types';
import {
  Entities,
  Steps,
  Relationships,
  PROJECT_MEMBERS_MAP,
} from '../../constants';
import { createUserEntityIdentifier } from '../../converters';

async function buildProjectHasUserRelationships({
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const projectMembersMap = await jobState.getData<
    Map<string, { id: number; accessLevel: number }[]>
  >(PROJECT_MEMBERS_MAP);

  if (!projectMembersMap) {
    throw new IntegrationMissingKeyError(
      `Expected users.ts to have set ${PROJECT_MEMBERS_MAP} in jobState.`,
    );
  }

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (projectEntity) => {
      const projectMembers = projectMembersMap.get(projectEntity._key);
      if (!projectMembers) {
        logger.warn(
          { _key: projectEntity._key },
          'Members for project not found',
        );
        return;
      }

      for (const member of projectMembers) {
        const userKey = createUserEntityIdentifier(member.id);
        if (!jobState.hasKey(userKey)) {
          logger.warn({ _key: userKey }, 'No user entity found for member ID');
          continue;
        }
        const projectMemberRelationship = createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key,
          fromType: Entities.PROJECT._type,
          toType: Entities.USER._type,
          toKey: userKey,
          properties: {
            accessLevel: member.accessLevel,
          },
        });

        if (jobState.hasKey(projectMemberRelationship._key)) {
          logger.info(
            { _key: projectMemberRelationship._key },
            '[SKIP] Duplicate project member relationship',
          );
          continue;
        }

        await jobState.addRelationship(projectMemberRelationship);
      }
    },
  );
  await jobState.deleteData(PROJECT_MEMBERS_MAP);
}

export default {
  id: Steps.BUILD_PROJECT_HAS_USER,
  name: 'Build project user relationships',
  entities: [],
  relationships: [Relationships.PROJECT_HAS_USER],
  dependsOn: [Steps.PROJECTS, Steps.USERS],
  executionHandler: buildProjectHasUserRelationships,
};
