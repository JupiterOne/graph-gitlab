import { v4 as uuid } from 'uuid';

import {
  createDirectRelationship,
  getRawData,
  IntegrationProviderAuthorizationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../constants';
import { createMergeRequestCommitEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabMergeRequest } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';

export async function fetchCommits({
  logger,
  instance,
  jobState,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config);

  const errorCorrelationId = uuid();

  await jobState.iterateEntities(
    { _type: Entities.MERGE_REQUEST._type },
    async (mergeRequestEntity) => {
      const mergeRequest = getRawData(mergeRequestEntity) as GitLabMergeRequest;
      await client.iterateMergeRequestCommits(
        mergeRequest.project_id,
        mergeRequest.iid,
        async (mergeRequestCommit) => {
          const commitEntity = await jobState.addEntity(
            createMergeRequestCommitEntity(mergeRequest, mergeRequestCommit),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: Relationships.MR_HAS_COMMIT._class,
              from: mergeRequestEntity,
              to: commitEntity,
            }),
          );
        },
        {
          onPageError: ({ err, endpoint }) => {
            const logDetail = {
              err,
              endpoint,
              projectId: mergeRequest.projectId,
              errorCorrelationId,
            };
            if (err instanceof IntegrationProviderAuthorizationError) {
              logger.warn(
                logDetail,
                'Unauthorized to fetch merge request commits for project',
              );
            } else {
              logger.error(
                logDetail,
                'Failed to fetch merge request commits for project',
              );
            }
          },
        },
      );
    },
  );
}

export const commitSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.COMMITS,
    name: 'Fetch MR commits',
    entities: [Entities.COMMIT],
    relationships: [Relationships.MR_HAS_COMMIT],
    dependsOn: [Steps.MERGE_REQUESTS, Steps.USERS],
    executionHandler: fetchCommits,
  },
];
