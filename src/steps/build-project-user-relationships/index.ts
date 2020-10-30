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
    id: Steps.BUILD_PROJECT_HAS_USER,
    name: 'Build project user relationships',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_USER],
    dependsOn: [Steps.PROJECTS, Steps.USERS],
    async executionHandler({
      jobState,
      instance,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<
      void
    > {
      const client = clientCreator(instance);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.PROJECT._type },
        async (project) => {
          const projectMembers = await client.fetchProjectMembers(
            parseInt(project.id as string, 10),
          );

          if (projectMembers.length > 0) {
            const projectMemberIds = [
              ...new Set(projectMembers.map((m) => m.id)),
            ];
            await jobState.addRelationships(
              projectMemberIds.map((memberId) =>
                createProjectUserRelationship(
                  project,
                  userIdMap.get(memberId.toString()) as Entity,
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

export function createProjectUserRelationship(
  project: Entity,
  user: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: project,
    to: user,
  });
}
