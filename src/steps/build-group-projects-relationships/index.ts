import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { ClientCreator, createGitlabClient } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';
import { Steps, Entities, Relationships } from '../../constants';

export function createStep(
  clientCreator: ClientCreator,
): IntegrationStep<GitlabIntegrationConfig> {
  return {
    id: Steps.BUILD_GROUP_HAS_PROJECT,
    name: 'Build group project relationships',
    entities: [],
    relationships: [Relationships.GROUP_HAS_PROJECT],
    dependsOn: [Steps.GROUPS, Steps.PROJECTS],
    async executionHandler({
      jobState,
      instance,
      logger,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<
      void
    > {
      const client = clientCreator(instance);
      const projectIdMap = await createProjectIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.GROUP._type },
        async (group) => {
          const groupProjects = await client.fetchGroupProjects(
            parseInt(group.id as string, 10),
          );

          if (groupProjects.length > 0) {
            for (const project of groupProjects) {
              const projectEntity = projectIdMap.get(project.id.toString());
              if (projectEntity) {
                await jobState.addRelationship(
                  createGroupProjectRelationship(group, projectEntity),
                );
              } else {
                logger.info(
                  {
                    project: {
                      id: project.id,
                      name: project.name,
                      visibility: project.visibility,
                    },
                  },
                  'Group project not found by fetch-projects, relationship will not be made',
                );
              }
            }
          }
        },
      );
    },
  };
}

async function createProjectIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const projectIdMap = new Map<string, Entity>();

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    (project) => {
      projectIdMap.set(project.id as string, project);
    },
  );
  return projectIdMap;
}

export default createStep((instance) => createGitlabClient(instance));

export function createGroupProjectRelationship(
  group: Entity,
  project: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: group,
    to: project,
  });
}
