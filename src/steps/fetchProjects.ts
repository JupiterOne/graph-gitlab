import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { GitLabProject } from '../provider/types';

export const STEP_ID = 'fetch-projects';
export const PROJECT_TYPE = 'gitlab_project';

const projectExists = (projects, id: number): boolean => {
  return projects.find((project) => project.id === id);
};

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch projects',
  types: [PROJECT_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    // const projects = await client.fetchProjects();

    console.log('fetching all projects');

    const allProjects = [];
    // Get all groups and subgroups
    const groups = await client.fetchGroups();

    for (const group of groups) {
      const projects = await client.fetchGroupProjects(group.id);
      for (const project of projects) {
        if (!projectExists(allProjects, project.id)) {
          allProjects.push(project);
        }
      }
    }

    // Use all those groups to get all the projects
    console.log('projects', allProjects);
    await jobState.addEntities(allProjects.map(createProjectEntity));
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
        owner: project.owner?.name,
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
