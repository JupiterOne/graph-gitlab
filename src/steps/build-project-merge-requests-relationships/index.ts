import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.BUILD_PROJECT_HAS_PR,
  name: 'Build project merge request relationships',
  entities: [],
  relationships: [Relationships.PROJECT_HAS_PR],
  dependsOn: [Steps.PROJECTS, Steps.MERGE_REQUESTS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const projectIdMap = await createProjectIdMap(jobState);

    await jobState.iterateEntities(
      { _type: Entities.MERGE_REQUEST._type },
      async (mergeRequest) => {
        if (mergeRequest.projectId) {
          const project = projectIdMap.get(mergeRequest.projectId.toString());

          if (project) {
            await jobState.addRelationships([
              createProjectMergeRequestRelationship(project, mergeRequest),
            ]);
          }
        }
      },
    );
  },
};

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

export default step;

export function createProjectMergeRequestRelationship(
  project: Entity,
  mergeRequest: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: project,
    to: mergeRequest,
  });
}
