import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from './fetchProjects';
import {
  STEP_ID as MERGE_REQUEST_STEP,
  MERGE_REQUEST_TYPE,
} from './fetchMergeRequests';

const step: IntegrationStep = {
  id: 'build-project-merge-request-relationships',
  name: 'Build project merge request relationships',
  types: ['gitlab_project_has_merge_request'],
  dependsOn: [PROJECT_STEP, MERGE_REQUEST_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const projectIdMap = await createProjectIdMap(jobState);

    await jobState.iterateEntities(
      { _type: MERGE_REQUEST_TYPE },
      async (mergeRequest) => {
        const project = projectIdMap.get(mergeRequest.projectId as string);

        if (project) {
          await jobState.addRelationships([
            createProjectMergeRequestRelationship(project, mergeRequest),
          ]);
        }
      },
    );
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

export function createProjectMergeRequestRelationship(
  project: Entity,
  mergeRequest: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: project,
    to: mergeRequest,
  });
}
