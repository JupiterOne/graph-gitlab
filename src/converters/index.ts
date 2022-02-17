import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import {
  GitLabMergeRequest,
  GitLabMergeCommitRequest,
  GitLabMergeRequestApproval,
  GitLabProject,
  GitLabUser,
} from '../provider/types';
import { getCommitWebLinkFromMergeRequest } from '../util/mergeRequest';

export function createProjectEntity(project: GitLabProject): Entity {
  const { _links, ...source } = project; // drop the _links
  const key = createProjectEntityIdentifier(project.id);

  return createIntegrationEntity({
    entityData: {
      source,
      assign: {
        _key: key,
        _type: Entities.PROJECT._type,
        _class: Entities.PROJECT._class,

        id: project.id.toString(),
        name: project.name,
        owner: project.owner?.name,
        createdOn: new Date(project.created_at).getTime(),
        description: project.description || undefined,
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
        allowMergeOnSkippedPipeline: !!project.allow_merge_on_skipped_pipeline,
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

export function createUserEntity(user: GitLabUser): Entity {
  const key = createUserEntityIdentifier(user.id);

  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _key: key,
        _type: Entities.USER._type,
        _class: Entities.USER._class,

        id: user.id.toString(),
        name: user.name,
        createdOn: new Date(user.created_at).getTime(),
        webLink: user.web_url,
        username: user.username,
        state: user.state,
        email: user.email,
        publicEmail: user.public_email,
        isAdmin: user.is_admin,
        canCreateGroup: user.can_create_group,
        canCreateProject: user.can_create_project,
        twoFactorEnabled: user.two_factor_enabled,
        external: user.external,
        privateProfile: user.private_profile,
        trial: user.trial,
        active: user.state === 'active',
      },
    },
  });
}

const USER_ID_PREFIX = 'gitlab-user';

export function createUserEntityIdentifier(id: number): string {
  return `${USER_ID_PREFIX}:${id}`;
}

export function createMergeRequestEntity(
  projectName: string,
  mergeRequest: GitLabMergeRequest,
  approval?: GitLabMergeRequestApproval,
): Entity {
  const key = createMergeRequestEntityIdentifier(mergeRequest.id);

  return createIntegrationEntity({
    entityData: {
      source: mergeRequest,
      assign: {
        _key: key,
        _type: Entities.MERGE_REQUEST._type,
        _class: Entities.MERGE_REQUEST._class,
        _rawData: [
          {
            name: 'approval',
            rawData: approval,
          },
        ],

        id: String(mergeRequest.id),
        iid: mergeRequest.iid,
        projectId: mergeRequest.project_id,
        name: mergeRequest.title,
        title: mergeRequest.title,
        state: mergeRequest.state,
        source: mergeRequest.source_branch,
        target: mergeRequest.target_branch,
        repository: projectName,
        createdOn: parseTimePropertyValue(mergeRequest.created_at),
        updatedOn: parseTimePropertyValue(mergeRequest.updated_at),
        authorId: mergeRequest.author.id,
        webLink: mergeRequest.web_url,
        mergeWhenPipelineSucceeds: mergeRequest.merge_when_pipeline_succeeds,
        shouldRemoveSourceBranch: !!mergeRequest.should_remove_source_branch,
        forceRemoveSourceBranch: mergeRequest.force_remove_source_branch,
        allowCollaboration: mergeRequest.allow_collaboration,
        allowMaintainerToPush: mergeRequest.allow_maintainer_to_push,
        squash: mergeRequest.squash,
        approved: approval?.approved,
        approvers: approval?.approved_by?.map((approver) => approver.user.name),
        approverIds: approval?.approved_by?.map((approver) =>
          String(approver.user.id),
        ),
        approverLogins: approval?.approved_by?.map(
          (approver) => approver.user.username,
        ),
        mergedOn: parseTimePropertyValue(mergeRequest.merged_at),
        closedOn: parseTimePropertyValue(mergeRequest.closed_at),
        sha: mergeRequest.sha,
        mergeCommitSha: mergeRequest.merge_commit_sha || undefined,
        squashCommitSha: mergeRequest.squash_commit_sha || undefined,
        commitWebLink: getCommitWebLinkFromMergeRequest(mergeRequest),
      },
    },
  });
}

export function createMergeRequestCommitEntity(
  mergeRequest: GitLabMergeRequest,
  mergeRequestCommit: GitLabMergeCommitRequest,
): Entity {
  const key = createCommitIdentifier(mergeRequestCommit.id);

  return createIntegrationEntity({
    entityData: {
      source: mergeRequestCommit,
      assign: {
        _key: key,
        _type: Entities.COMMIT._type,
        _class: Entities.COMMIT._class,
        id: String(mergeRequestCommit.id),
        shortId: String(mergeRequestCommit.short_id),
        title: mergeRequestCommit.title,
        name: mergeRequestCommit.title,
        branch: mergeRequest.source_branch,
        merge: false,
        versionBump: false,
        createdOn: parseTimePropertyValue(mergeRequestCommit.created_at),
        webLink: mergeRequestCommit.web_url,
        message: mergeRequestCommit.message,
        authoredOn: parseTimePropertyValue(mergeRequestCommit.authored_date),
        committedOn: parseTimePropertyValue(mergeRequestCommit.committed_date),
        commitWebLink: mergeRequestCommit.web_url,
        committerName: mergeRequestCommit.committer_name,
        committerEmail: mergeRequestCommit.committer_email,
        authorName: mergeRequestCommit.author_name,
        authorEmail: mergeRequestCommit.author_email,
      },
    },
  });
}

const MERGE_REQUEST_ID_PREFIX = 'gitlab-merge-request';
export function createMergeRequestEntityIdentifier(id: number): string {
  return `${MERGE_REQUEST_ID_PREFIX}:${id}`;
}

const COMMIT_ID_PREFIX = 'gitlab-commit';
export function createCommitIdentifier(id: number): string {
  return `${COMMIT_ID_PREFIX}:${id}`;
}
