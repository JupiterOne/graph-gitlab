import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient, ClientCreator } from '../../provider';
import { STEP_ID as GROUP_STEP, GROUP_TYPE } from '../fetch-groups';
import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from '../fetch-projects';
import { GitlabIntegrationConfig } from '../../types';

export function createStep(clientCreator: ClientCreator): IntegrationStep {
  return {
    id: 'build-group-project-relationships',
    name: 'Build group project relationships',
    types: ['gitlab_group_has_project'],
    dependsOn: [GROUP_STEP, PROJECT_STEP],
    async executionHandler({
      jobState,
      instance,
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
          await jobState.addRelationships(
            groupProjects.map((project) =>
              createGroupProjectRelationship(
                group,
                projectIdMap.get(project.id.toString()),
              ),
            ),
          );
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
