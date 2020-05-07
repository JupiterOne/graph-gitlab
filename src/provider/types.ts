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

export interface GitLabProject {
  id: number;
  name: string;
  namespace: {
    id: number;
    parent_id: number;
    kind: string;
  };
  owner?: {
    id: number;
    name: string;
  };
  created_at: string;
  description: string;
  web_url: string;
  visibility: string;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  jobs_enabled: boolean;
  wiki_enabled: boolean;
  snippets_enabled: boolean;
  can_create_merge_request_in: boolean;
  resolve_outdated_diff_discussions: boolean;
  container_registry_enabled: boolean;
  archived: boolean;
  shared_runners_enabled: boolean;
  public_jobs: boolean;
  only_allow_merge_if_pipeline_succeeds: boolean;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  remove_source_branch_after_merge: boolean;
  request_access_enabled: boolean;
  autoclose_referenced_issues: boolean;
}

export interface GitLabMergeRequest {
  id: number;
  project_id: number;
  title: string;
  state: string;
  source_branch: string;
  target_branch: string;
  description: string;
  created_at: string;
  author: {
    id: number;
  };
  web_url: string;
  merge_when_pipeline_succeeds: boolean;
  should_remove_source_branch: boolean;
  force_remove_source_branch: boolean;
  allow_collaboration: boolean;
  allow_maintainer_to_push: boolean;
  squash: boolean;
}
