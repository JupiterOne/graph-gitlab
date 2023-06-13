import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps } from '../constants';
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

      await client.iterateProjectVulnerabilities(
        project.id,
        async (finding) => {
          await jobState.addEntity(createVulnerabilityFindingEntity(finding));
        },
      );
    },
  );
}

export const findingSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.FINDINGS,
    name: 'Fetch Vulnerability Findings',
    entities: [Entities.FINDING],
    relationships: [],
    dependsOn: [Steps.PROJECTS],
    executionHandler: fetchVulnerabilityFindings,
  },
];
