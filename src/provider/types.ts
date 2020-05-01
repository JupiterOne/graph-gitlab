export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  created_at: string;
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
}
