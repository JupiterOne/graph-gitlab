import { v4 as uuid } from 'uuid';

import {
  createDirectRelationship,
  getRawData,
  IntegrationConfigLoadError,
  IntegrationProviderAuthorizationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../constants';
import {
  createMergeRequestEntity,
  createUserEntityIdentifier,
} from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabMergeRequestApproval, GitLabProject } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';

export async function fetchMergeRequests({
  logger,
  instance,
  jobState,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const updatedAfter = instance.config.mergeRequestsUpdatedAfter;
  if (!updatedAfter) {
    throw new IntegrationConfigLoadError(
      'Missing config.mergeRequestsUpdatedAfter!',
    );
  }

  const client = createGitlabClient(instance.config);

  let totalProjectsProcessed = 0;
  let totalErrors = 0;

  const errorCorrelationId = uuid();
  const unauthorizedProjectIds = new Set<number>();

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (projectEntity) => {
      const project = getRawData(projectEntity) as GitLabProject;

      await client.iterateProjectMergeRequests(
        project.id,
        async (mergeRequest) => {
          let approval: GitLabMergeRequestApproval | undefined;
          try {
            approval = await client.fetchMergeRequestApprovals(
              project.id,
              mergeRequest.iid,
            );
          } catch (err) {
            logger.warn(
              { err, projectId: project.id, errorCorrelationId },
              'Failed to fetch merge request approval',
            );
          }

          const mergeRequestEntity = await jobState.addEntity(
            createMergeRequestEntity(project.name, mergeRequest, approval),
          );

          if (approval && approval.approved_by) {
            for (const approver of approval.approved_by) {
              const userEntityKey = createUserEntityIdentifier(
                approver.user.id,
              );
              const userEntity = await jobState.findEntity(userEntityKey);
              if (userEntity) {
                await jobState.addRelationship(
                  createDirectRelationship({
                    _class: RelationshipClass.APPROVED,
                    from: userEntity,
                    to: mergeRequestEntity,
                  }),
                );
              } else {
                logger.warn(
                  { mergeRequestId: mergeRequest.id, userEntityKey },
                  'Failed to locate user entity for merge request approval',
                );
              }
            }
          }
        },
        {
          onPageError: ({ err, endpoint }) => {
            const logDetail = {
              err,
              endpoint,
              projectId: project.id,
              errorCorrelationId,
            };
            if (err instanceof IntegrationProviderAuthorizationError) {
              logger.warn(
                logDetail,
                'Unauthorized to fetch merge requests for project',
              );
              unauthorizedProjectIds.add(project.id);
            } else {
              logger.error(
                logDetail,
                'Failed to fetch merge requests for project',
              );
            }

            totalErrors++;
          },
          updatedAfter,
        },
      );

      totalProjectsProcessed++;
    },
  );

  logger.publishEvent({
    name: 'stats',
    description: `Processed merge requests for ${totalProjectsProcessed} projects${
      totalErrors > 0
        ? `, errors for ${totalErrors} projects${
            unauthorizedProjectIds.size > 0
              ? `(${unauthorizedProjectIds.size} unauthorized)`
              : ''
          } projects (errorId="${errorCorrelationId}")`
        : ''
    }`,
  });
}

export const mergeRequestSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.MERGE_REQUESTS,
    name: 'Fetch merge requests',
    entities: [Entities.MERGE_REQUEST],
    relationships: [Relationships.USER_APPROVED_PR],
    dependsOn: [Steps.PROJECTS, Steps.USERS],
    executionHandler: fetchMergeRequests,
  },
];
