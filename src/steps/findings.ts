import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../constants';
import { createGitlabClient } from '../provider';
import { GitlabIntegrationConfig } from '../types';
import { GitLabProject } from '../provider/types';
import { createVulnerabilityFindingEntity } from '../converters';

export async function fetchVulnerabilityFindings({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (projectEntity) => {
      const project = getRawData(projectEntity) as GitLabProject;

      try {
        await client.iterateProjectVulnerabilities(
          project.id,
          async (finding) => {
            const findingEntity = createVulnerabilityFindingEntity(finding);

            await Promise.all([
              jobState.addEntity(findingEntity),
              jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.HAS,
                  from: projectEntity,
                  to: findingEntity,
                }),
              ),
            ]);
          },
        );
      } catch (e) {
        if (e.status === 403) {
          logger.warn(
            `User does not have permission to fetch findings for project ${project.id}. Please ensure access type is either Developer, 	Maintainer or Owner for this project.`,
          );
        } else {
          throw e;
        }
      }
    },
  );
}

export const findingSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.FINDINGS,
    name: 'Fetch Vulnerability Findings',
    entities: [Entities.FINDING],
    relationships: [Relationships.PROJECT_HAS_FINDING],
    dependsOn: [Steps.PROJECTS],
    executionHandler: fetchVulnerabilityFindings,
  },
];
