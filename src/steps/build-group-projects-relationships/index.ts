import {
  createIntegrationRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { ClientCreator, createGitlabClient } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';
import { GROUP_TYPE, STEP_ID as GROUP_STEP } from '../fetch-groups';
import { PROJECT_TYPE, STEP_ID as PROJECT_STEP } from '../fetch-projects';

export function createStep(
  clientCreator: ClientCreator,
): IntegrationStep<GitlabIntegrationConfig> {
  return {
    id: 'build-group-project-relationships',
    name: 'Build group project relationships',
    types: ['gitlab_group_has_project'],
    dependsOn: [GROUP_STEP, PROJECT_STEP],
    async executionHandler({
      jobState,
      instance,
      logger,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<
      void
    > {
      const client = clientCreator(instance);
      const projectIdMap = await createProjectIdMap(jobState);

      await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
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
      });
    },
  };
}

async function createProjectIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const projectIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: PROJECT_TYPE }, (project) => {
    projectIdMap.set(project.id as string, project);
  });
  return projectIdMap;
}

export default createStep((instance) => createGitlabClient(instance));

export function createGroupProjectRelationship(
  group: Entity,
  project: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: group,
    to: project,
  });
}
