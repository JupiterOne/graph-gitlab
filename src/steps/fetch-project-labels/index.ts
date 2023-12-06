import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../../constants';
import { createLabelEntity } from '../../converters';
import { createGitlabClient } from '../../provider';
import { GitLabProject } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';

export async function fetchProjectLabels({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (projectEntity) => {
      const project = getRawData(projectEntity) as GitLabProject;

      await client.iterateProjectLabels(project.id, async (label) => {
        const labelEntity = createLabelEntity(label);
        if (!jobState.hasKey(labelEntity._key)) {
          await jobState.addEntity(labelEntity);
        }
        const projectLabelRelationship = createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: projectEntity,
          to: labelEntity,
        });
        if (!jobState.hasKey(projectLabelRelationship._key)) {
          await jobState.addRelationship(projectLabelRelationship);
        }
      });
    },
  );
}

export const projectLabelSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.PROJECT_LABELS,
    name: 'Fetch Project Labels',
    entities: [Entities.LABEL],
    relationships: [Relationships.PROJECT_HAS_LABEL],
    dependsOn: [Steps.PROJECTS],
    executionHandler: fetchProjectLabels,
  },
];
