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
import { getAccessLevel } from '../../util/getAccessLevel';

export function createStep(
  clientCreator: ClientCreator,
): IntegrationStep<GitlabIntegrationConfig> {
  return {
    id: Steps.BUILD_PROJECT_HAS_USER,
    name: 'Build project user relationships',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_USER],
    dependsOn: [Steps.PROJECTS, Steps.USERS],
    async executionHandler({
      jobState,
      instance,
      logger,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<void> {
      const client = clientCreator(instance, logger);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.PROJECT._type },
        async (project) => {
          const projectMembers = await client.fetchProjectMembers(
            parseInt(project.id as string, 10),
          );

          const projectMemberRelationshipKeys = new Set<string>();

          for (const member of projectMembers) {
            const projectMemberRelationship = createProjectUserRelationship(
              project,
              userIdMap.get(member.id.toString()) as Entity,
              getAccessLevel(member.access_level),
            );

            if (
              projectMemberRelationshipKeys.has(projectMemberRelationship._key)
            ) {
              logger.info(
                { _key: projectMemberRelationship._key },
                '[SKIP] Duplicate project member relationship',
              );
              continue;
            }

            projectMemberRelationshipKeys.add(projectMemberRelationship._key);
            await jobState.addRelationship(projectMemberRelationship);
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

export function createProjectUserRelationship(
  project: Entity,
  user: Entity,
  userAccessLevel: string,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: project,
    to: user,
    properties: {
      userAccessLevel,
    },
  });
}
