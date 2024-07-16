import { Opaque } from 'type-fest';

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  created_at: string;
  web_url: string;
  state: string;
  email: string;
  public_email: string;
  is_admin: boolean;
  can_create_group: boolean;
  can_create_project: boolean;
  two_factor_enabled: boolean;
  external: boolean;
  private_profile: boolean;
  trial: boolean;
}

export interface GitLabUserRef {
  id: number;
  name: string;
  username: string;
  state: string;
  access_level: number;
}

export interface GitLabGroup {
  id: number;
  parent_id: number | null;
  name: string;
  web_url: string;
  created_at: string;
  path: string;
  description: string;
  visibility: string;
  share_with_group_lock: boolean;
  require_two_factor_authentication: boolean;
  two_factor_grace_period: number;
  project_creation_level: string;
  auto_devops_enabled: boolean;
  subgroup_creation_level: string;
  emails_disabled: boolean;
  mentions_disabled: boolean;
  lfs_enabled: boolean;
  default_branch_protection: number;
  request_access_enabled: boolean;
  full_name: string;
  full_path: string;
  file_template_project_id: number;
}

export interface GitLabFinding {
  id: number;
  report_type?: string;
  name?: string;
  severity?: string;
  confidence?: string;
  scanner?: {
    external_id?: string;
    name?: string;
    vendor?: string;
  };
  identifiers?: [
    {
      external_type: string;
      external_id: string;
      name: string;
      url: string;
    },
  ];
  project_fingerprint?: string;
  uuid?: string;
  create_jira_issue_url?: string;
  false_positive?: boolean;
  create_vulnerability_feedback_issue_path?: string;
  create_vulnerability_feedback_merge_request_path?: string;
  create_vulnerability_feedback_dismissal_path?: string;
  project?: {
    id?: number;
    name?: string;
    full_path?: string;
    full_name?: string;
  };
  dismissal_feedback?: string;
  issue_feedback?: string;
  merge_request_feedback?: string;
  description?: null;
  links?: [{ url: string }];
  location?: {
    file?: string;
    start_line?: number;
    class?: string;
    method?: string;
    hostname?: string;
  };
  solution?: string;
  evidence?: string;
  details?: {
    urls: { name?: string; type?: string };
    discovered_at?: {
      name?: string;
      type?: string;
      value?: string;
    };
  };
  state?: string;
  scan?: {
    type?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
  };
  blob_path?: string;
}

export type GitLabVersion = {
  version: string;
  revision: string;
  enterprise: boolean;
};

export type GitLabProject = Opaque<any, 'GitLabProject'>;

export type GitLabMergeRequest = {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  /** @deprecated Deprecated in GitLab 14.7, and scheduled for removal in API version 5. Use merge_user instead. */
  merged_by?: Author;
  merge_user: Author;
  merged_at: string;
  closed_by: any;
  closed_at: any;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  author: Author;
  assignees: any[];
  assignee: any;
  reviewers: any[];
  source_project_id: number;
  target_project_id: number;
  labels: any[];
  draft: boolean;
  imported: boolean;
  imported_from: string;
  /** @deprecated Use draft instead. */
  work_in_progress?: boolean;
  milestone: any;
  merge_when_pipeline_succeeds: boolean;
  /** @deprecated Deprecated in GitLab 15.6. Use detailed_merge_status instead. */
  merge_status?: string;
  detailed_merge_status: string;
  sha: string;
  merge_commit_sha: string;
  squash_commit_sha: any;
  discussion_locked: any;
  should_remove_source_branch: boolean;
  force_remove_source_branch: boolean;
  prepared_at: string;
  /** @deprecated Deprecated in GitLab 12.7, and scheduled for removal in API version 5. Use references instead. */
  reference?: string;
  references: References;
  web_url: string;
  time_stats: TimeStats;
  squash: boolean;
  squash_on_merge: boolean;
  task_completion_status: TaskCompletionStatus;
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
  /** @deprecated Deprecated in GitLab 16.0. Premium and Ultimate only. */
  approvals_before_merge?: any;

  // TODO: check if these are actually in the response, keeping them here for now.
  allow_collaboration: boolean;
  allow_maintainer_to_push: boolean;
};

interface Author {
  id: number;
  username: string;
  name: string;
  state: string;
  locked: boolean;
  avatar_url: string;
  web_url: string;
}

interface References {
  short: string;
  relative: string;
  full: string;
}

interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate: any;
  human_total_time_spent: any;
}

interface TaskCompletionStatus {
  count: number;
  completed_count: number;
}

export type GitLabMergeCommitRequest = Opaque<any, 'GitLabMergeCommitRequest'>;

// https://docs.gitlab.com/ee/api/merge_request_approvals.html#get-configuration-1
export type GitLabMergeRequestApproval = Opaque<
  any,
  'GitLabMergeRequestApproval'
>;

export interface GitlabLabel {
  id: number;
  color: string;
  text_color: string;
  name: string;
  description?: string | null;
  description_html?: string | null;
  open_issues_count: number;
  closed_issues_count: number;
  open_merge_requests_count: number;
  subscribed: boolean;
  priority?: number;
  is_project_label?: boolean | null;
}
