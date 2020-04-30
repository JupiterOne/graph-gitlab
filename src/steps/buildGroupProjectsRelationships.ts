import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { STEP_ID as GROUP_STEP, GROUP_TYPE } from './fetchGroups';
import {
  STEP_ID as PROJECT_STEP,
  PROJECT_TYPE,
  createProjectEntityIdentifier,
} from './fetchProjects';

const step: IntegrationStep = {
  id: 'build-group-project-relationships',
  name: 'Build group project relationships',
  types: ['gitlab_group_has_project'],
  dependsOn: [GROUP_STEP, PROJECT_STEP],
  async executionHandler({
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const projectIdMap = await createProjectIdMap(jobState);

    await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
      const [, id] = group.id.toString().split(':');

      const groupProjects = await client.fetchGroupProjects(parseInt(id, 10));

      if (groupProjects.length > 0) {
        await jobState.addRelationships(
          groupProjects.map((project) =>
            createGroupProjectRelationship(
              group,
              projectIdMap.get(createProjectEntityIdentifier(project.id)),
            ),
          ),
        );
      }
    });
  },
};

async function createProjectIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const projectIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: PROJECT_TYPE }, (project) => {
    projectIdMap.set(project.id as string, project);
  });

  return projectIdMap;
}

export default step;

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
