import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { GitLabProject } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';

export const STEP_ID = 'fetch-projects';
export const PROJECT_TYPE = 'gitlab_project';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch projects',
  types: [PROJECT_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
    const client = createGitlabClient(instance);
    const projects = await client.fetchProjects();
    await jobState.addEntities(projects.map(createProjectEntity));
  },
};

export function createProjectEntity(project: GitLabProject): Entity {
  const key = createProjectEntityIdentifier(project.id);

  return createIntegrationEntity({
    entityData: {
      source: project,
      assign: {
        _key: key,
        _type: PROJECT_TYPE,
        _class: ['Project', 'CodeRepo'],

        id: project.id.toString(),
        name: project.name,
        owner: project.owner?.name,
        createdOn: new Date(project.created_at).getTime(),
        description: project.description,
        webLink: project.web_url,
        visibility: project.visibility,
        public: project.visibility !== 'private',
        issuesEnabled: project.issues_enabled,
        mergeRequestsEnabled: project.merge_requests_enabled,
        jobsEnabled: project.jobs_enabled,
        wikiEnabled: project.wiki_enabled,
        snippetsEnabled: project.snippets_enabled,
        canCreateMergeRequestIn: project.can_create_merge_request_in,
        resolveOutdatedDiffDiscussions:
          project.resolve_outdated_diff_discussions,
        containerRegistryEnabled: project.container_registry_enabled,
        archived: project.archived,
        sharedRunnersEnabled: project.shared_runners_enabled,
        publicJobs: project.public_jobs,
        onlyAllowMergeIfPipelineSucceeds:
          project.only_allow_merge_if_pipeline_succeeds,
        onlyAllowMergeIfAllDiscussionsAreResolved:
          project.only_allow_merge_if_all_discussions_are_resolved,
        removeSourceBranchAfterMerge: project.remove_source_branch_after_merge,
        requestAccessEnabled: project.request_access_enabled,
        autocloseReferencedIssues: project.autoclose_referenced_issues,
      },
    },
  });
}

const PROJECT_ID_PREFIX = 'gitlab-project';
export function createProjectEntityIdentifier(id: number): string {
  return `${PROJECT_ID_PREFIX}:${id}`;
}

export default step;
