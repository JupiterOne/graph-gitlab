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

export type GitLabProject = Opaque<any, 'GitLabProject'>;

export interface GitLabMergeRequest {
  id: number;
  iid: number;
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

export interface GitLabMergeRequestApprovedUser {
  user: {
    id: number;
    name: string;
  };
}

export interface GitLabMergeRequestApproval {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  state: string;
  description: string;
  created_at: string;
  approved: boolean;
  approved_by: GitLabMergeRequestApprovedUser[];
}
