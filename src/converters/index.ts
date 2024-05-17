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
  GitLabFinding,
  GitlabLabel,
  GitLabVersion,
} from '../provider/types';
import { getCommitWebLinkFromMergeRequest } from '../util/mergeRequest';

export function createAccountEntity(
  tokenOwner: GitLabUser,
  systemVersion: GitLabVersion,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: { systemVersion, tokenOwner },
      assign: {
        _key: createAccountEntityKey(systemVersion.version),
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,
        id: tokenOwner.id.toString(),
        name: tokenOwner.name,
        version: systemVersion.version,
        revision: systemVersion.revision,
        enterprise: systemVersion.enterprise,
      },
    },
  });
}

const ACCOUNT_VERSION_PREFIX = 'gitlab-account-version';
export function createAccountEntityKey(version: string): string {
  return `${ACCOUNT_VERSION_PREFIX}:${version}`;
}

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
        topics: project.topics,
        fullName: project.path_with_namespace,
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
        email: user.email || user.public_email || undefined,
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
        displayName: mergeRequestCommit.title,
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

export function createVulnerabilityFindingEntity(
  finding: GitLabFinding,
): Entity {
  const key = createFindingIdentifier(finding.id);

  // For more Finding data model class required fields info please visit: https://github.com/JupiterOne/data-model/blob/main/src/schemas/Finding.json.
  return createIntegrationEntity({
    entityData: {
      source: finding,
      assign: {
        _key: key,
        _type: Entities.FINDING._type,
        _class: Entities.FINDING._class,
        // START: finding data model required fields
        category: finding?.report_type,
        severity: finding?.severity,
        numericSeverity: getNumericSeverity(finding?.severity),
        open: finding.state?.toLocaleLowerCase() === 'detected',
        // END: finding data model required fields
        id: String(finding.id),
        reportType: finding.report_type,
        name: finding.name,
        confidence: finding.confidence,
        'scanner.externalId': finding.scanner?.external_id,
        'scanner.name': finding.scanner?.name,
        'scanner.vendor': finding.scanner?.vendor,
        identifiers: finding.identifiers?.map(
          (identifier) => identifier.external_id,
        ),
        projectFingerprint: finding.project_fingerprint,
        uuid: finding.uuid,
        createJiraIssueUrl: finding.create_jira_issue_url,
        falsePositive: finding.false_positive,
        createVulnerabilityFeedbackIssuePath:
          finding.create_vulnerability_feedback_issue_path,
        createVulnerabilityFeedbackMergeRequestPath:
          finding.create_vulnerability_feedback_merge_request_path,
        createVulnerabilityFeedbackDismissalPath:
          finding.create_vulnerability_feedback_dismissal_path,
        'project.id': finding.project?.id,
        'project.name': finding.project?.name,
        'project.fullPath': finding.project?.full_path,
        'project.fullName': finding.project?.full_name,
        dismissalFeedback: finding.dismissal_feedback,
        issueFeedback: finding.issue_feedback,
        mergeRequestFeedback: finding.merge_request_feedback,
        description: finding.description,
        links: finding.links?.map((link) => link.url),
        'location.file': finding.location?.file,
        'location.startLine': finding.location?.start_line,
        'location.class': finding.location?.class,
        'location.method': finding.location?.method,
        'location.hostname': finding.location?.hostname,
        solution: finding.solution,
        evidence: finding.evidence,
        state: finding.state,
        blobPath: finding.blob_path,
        'scan.type': finding.scan?.type,
        'scan.status': finding.scan?.status,
        'scan.startTime': parseTimePropertyValue(finding.scan?.start_time),
        'scan.endTime': parseTimePropertyValue(finding.scan?.end_time),
      },
    },
  });
}

const FINDING_ID_PREFIX = 'gitlab-finding';
export function createFindingIdentifier(id: number): string {
  return `${FINDING_ID_PREFIX}:${id}`;
}

export function getNumericSeverity(severity: string | undefined) {
  if (!severity) {
    return 0;
  } else if (/critical/i.test(severity)) {
    return 10;
  } else if (/high/i.test(severity)) {
    return 7;
  } else if (/medium/i.test(severity)) {
    return 5;
  } else if (/low/i.test(severity)) {
    return 2;
  } else if (/info/i.test(severity)) {
    return 1;
  } else if (/unknown/i.test(severity)) {
    return undefined;
  }
}

export function createLabelEntity(label: GitlabLabel): Entity {
  const key = createLabelEntityIdentifier(label.id);

  return createIntegrationEntity({
    entityData: {
      source: label,
      assign: {
        _key: key,
        _type: Entities.LABEL._type,
        _class: Entities.LABEL._class,
        id: label.id.toString(),
        displayName: label.name,
        name: label.name,
        description: label.description ?? undefined,
        color: label.color,
        textColor: label.text_color,
        openIssuesCount: label.open_issues_count,
        closedIssuesCount: label.closed_issues_count,
        openMergeRequestsCount: label.open_merge_requests_count,
        subscribed: label.subscribed,
        priority: label.priority,
      },
    },
  });
}

const LABEL_ID_PREFIX = 'gitlab-label';

export function createLabelEntityIdentifier(id: number): string {
  return `${LABEL_ID_PREFIX}:${id}`;
}
