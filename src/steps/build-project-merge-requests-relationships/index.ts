import {
  Entity,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps, Relationships } from '../../constants';
import { createProjectEntityIdentifier } from '../../converters';

const step: IntegrationStep = {
  id: Steps.BUILD_PROJECT_HAS_PR,
  name: 'Build project merge request relationships',
  entities: [],
  relationships: [Relationships.PROJECT_HAS_PR],
  dependsOn: [Steps.PROJECTS, Steps.MERGE_REQUESTS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    await jobState.iterateEntities(
      { _type: Entities.MERGE_REQUEST._type },
      async (mergeRequest) => {
        if (mergeRequest.projectId) {
          const project = await jobState.findEntity(
            createProjectEntityIdentifier(mergeRequest.projectId as number),
          );

          if (project) {
            await jobState.addRelationship(
              createProjectMergeRequestRelationship(project, mergeRequest),
            );
          }
        }
      },
    );
  },
};

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
