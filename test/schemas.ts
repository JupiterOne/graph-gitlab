import { GraphObjectSchema } from '@jupiterone/integration-sdk-testing';

export const projectClass = ['CodeRepo', 'Project'];
export const projectSchema: GraphObjectSchema = {
  additionalProperties: false,
  properties: {
    _key: { pattern: 'gitlab-project:[0-9]+' },
    _class: { const: projectClass },
    _type: { const: 'gitlab_project' },
    _rawData: { type: 'array', items: { type: 'object' } },
    name: { type: 'string' },
    createdOn: { type: 'number' },
    description: { type: 'string' },
    webLink: { type: 'string' },
    visibility: { type: 'string' },
    public: { type: 'boolean' },
    issuesEnabled: { type: 'boolean' },
    mergeRequestsEnabled: { type: 'boolean' },
    jobsEnabled: { type: 'boolean' },
    wikiEnabled: { type: 'boolean' },
    snippetsEnabled: { type: 'boolean' },
    canCreateMergeRequestIn: { type: 'boolean' },
    resolveOutdatedDiffDiscussions: { type: ['boolean', 'null'] },
    containerRegistryEnabled: { type: 'boolean' },
    archived: { type: 'boolean' },
    sharedRunnersEnabled: { type: 'boolean' },
    publicJobs: { type: 'boolean' },
    allowMergeOnSkippedPipeline: { type: 'boolean' },
    onlyAllowMergeIfPipelineSucceeds: { type: 'boolean' },
    onlyAllowMergeIfAllDiscussionsAreResolved: { type: 'boolean' },
    removeSourceBranchAfterMerge: { type: 'boolean' },
    requestAccessEnabled: { type: 'boolean' },
    autocloseReferencedIssues: { type: 'boolean' },
  },
};

export const userClass = ['User'];
export const userSchema: GraphObjectSchema = {
  additionalProperties: false,
  properties: {
    _key: { pattern: 'gitlab-user:[0-9]+' },
    _class: { const: userClass },
    _type: { const: 'gitlab_user' },
    _rawData: { type: 'array', items: { type: 'object' } },
    name: { type: 'string' },
    createdOn: { type: 'number' },
    webLink: { type: 'string' },
    username: { type: 'string' },
    state: { type: 'string' },
    email: { type: 'string' },
    publicEmail: { type: 'string' },
    isAdmin: { type: 'boolean' },
    canCreateGroup: { type: 'boolean' },
    canCreateProject: { type: 'boolean' },
    twoFactorEnabled: { type: 'boolean' },
    external: { type: 'boolean' },
    privateProfile: { type: 'boolean' },
    trial: { type: 'boolean' },
  },
};

export const prClass = ['CodeReview', 'PR'];
export const prSchema: GraphObjectSchema = {
  additionalProperties: false,
  properties: {
    _key: { pattern: 'gitlab-merge-request:[0-9]+' },
    _class: { const: prClass },
    _type: { const: 'gitlab_merge_request' },
    _rawData: { type: 'array', items: { type: 'object' } },

    id: { pattern: '[0-9]+' },
    iid: { type: 'number' },
    projectId: { type: 'number' },
    authorId: { type: 'number' },

    name: { type: 'string' },
    title: { type: 'string' },
    state: { type: 'string' },
    source: { type: 'string' },
    target: { type: 'string' },
    repository: { type: 'string' },

    mergeWhenPipelineSucceeds: { type: 'boolean' },
    shouldRemoveSourceBranch: { type: 'boolean' },
    forceRemoveSourceBranch: { type: 'boolean' },
    allowCollaboration: { type: 'boolean' },
    allowMaintainerToPush: { type: 'boolean' },
    squash: { type: 'boolean' },

    approvers: { type: 'array', items: { type: 'string' } },
    approverIds: { type: 'array', items: { type: 'string' } },
    approverLogins: { type: 'array', items: { type: 'string' } },

    createdOn: { type: 'number' },
    webLink: { type: 'string' },
    mergedOn: { type: 'number' },
    closedOn: { type: 'number' },
    sha: { type: 'string' },
    mergeCommitSha: { type: 'string' },
    squashCommitSha: { type: 'string' },
    commitWebLink: { type: 'string' },
  },
};
