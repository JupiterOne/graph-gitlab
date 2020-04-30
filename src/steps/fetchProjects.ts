import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { GitLabProject } from '../provider/GitlabClient';
import { createGitlabClient } from '../provider';

export const STEP_ID = 'fetch-projects';
export const PROJECT_TYPE = 'gitlab_project';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch projects',
  types: [PROJECT_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const projects = await client.fetchProjects();

    await jobState.addEntities(projects.map(createProjectEntity));
  },
};

export function createProjectEntity(project: GitLabProject): Entity {
  const id = createProjectEntityIdentifier(project.id);

  return createIntegrationEntity({
    entityData: {
      source: project,
      assign: {
        _key: id,
        _type: PROJECT_TYPE,
        _class: 'Project',

        id,
        name: project.name,
        owner: 'TODO',
        createdOn: new Date(project.created_at).getTime(),
      },
    },
  });
}

const PROJECT_ID_PREFIX = 'gitlab-project';
export function createProjectEntityIdentifier(id: number): string {
  return `${PROJECT_ID_PREFIX}:${id}`;
}

export default step;
