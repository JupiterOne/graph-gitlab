import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { GitLabMergeRequest } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';
import { Steps, Entities } from '../../constants';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: Steps.MERGE_REQUESTS,
  name: 'Fetch merge requests',
  entities: [Entities.MERGE_REQUEST],
  relationships: [],
  dependsOn: [Steps.PROJECTS],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
    const client = createGitlabClient(instance);

    await jobState.iterateEntities(
      { _type: Entities.PROJECT._type },
      async (project) => {
        const mergeRequests = await client.fetchProjectMergeRequests(
          parseInt(project.id as string, 10),
        );

        await jobState.addEntities(
          mergeRequests.map((mergeRequest) =>
            createMergeRequestEntity(
              mergeRequest,
              project.displayName as string,
            ),
          ),
        );
      },
    );
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
