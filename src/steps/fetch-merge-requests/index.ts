import { v4 as uuid } from 'uuid';

import {
  createIntegrationEntity,
  Entity,
  getRawData,
  IntegrationProviderAuthorizationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps } from '../../constants';
import { createGitlabClient } from '../../provider';
import { GitLabMergeRequest, GitLabProject } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: Steps.MERGE_REQUESTS,
  name: 'Fetch merge requests',
  entities: [Entities.MERGE_REQUEST],
  relationships: [],
  dependsOn: [Steps.PROJECTS],
  async executionHandler({
    logger,
    instance,
    jobState,
  }: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
    const client = createGitlabClient(instance);

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
            await jobState.addEntity(
              createMergeRequestEntity(mergeRequest, project.name),
            );
          },
          ({ err, endpoint }) => {
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
  },
};

export function createMergeRequestEntity(
  mergeRequest: GitLabMergeRequest,
  projectName: string,
): Entity {
  const key = createMergeRequestEntityIdentifier(mergeRequest.id);

  return createIntegrationEntity({
    entityData: {
      source: mergeRequest,
      assign: {
        _key: key,
        _type: Entities.MERGE_REQUEST._type,
        _class: Entities.MERGE_REQUEST._class,

        id: mergeRequest.id.toString(),
        iid: mergeRequest.iid,
        projectId: mergeRequest.project_id.toString(),
        name: mergeRequest.title,
        title: mergeRequest.title,
        state: mergeRequest.state,
        source: mergeRequest.source_branch,
        target: mergeRequest.target_branch,
        repository: projectName,
        createdOn: new Date(mergeRequest.created_at).getTime(),
        authorId: mergeRequest.author.id.toString(),
        webLink: mergeRequest.web_url,
        mergeWhenPipelineSucceeds: mergeRequest.merge_when_pipeline_succeeds,
        shouldRemoveSourceBranch: mergeRequest.should_remove_source_branch,
        forceRemoveSourceBranch: mergeRequest.force_remove_source_branch,
        allowCollaboration: mergeRequest.allow_collaboration,
        allowMaintainerToPush: mergeRequest.allow_maintainer_to_push,
        squash: mergeRequest.squash,
      },
    },
  });
}

const MERGE_REQUEST_ID_PREFIX = 'gitlab-merge-request';
export function createMergeRequestEntityIdentifier(id: number): string {
  return `${MERGE_REQUEST_ID_PREFIX}:${id}`;
}

export default step;
