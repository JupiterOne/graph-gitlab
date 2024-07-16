import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const PROJECT_MEMBERS_MAP = 'project-members-map';

export const Steps = {
  ACCOUNTS: 'fetch-accounts',
  USERS: 'fetch-users',
  GROUPS: 'fetch-groups',
  PROJECTS: 'fetch-projects',
  MERGE_REQUESTS: 'fetch-merge-requests',
  COMMITS: 'fetch-mr-commits',
  FINDINGS: 'fetch-vulnerability-findings',
  BUILD_ACCOUNT_HAS_PROJECT: 'build-account-project-relationships',
  BUILD_ACCOUNT_HAS_GROUP: 'build-account-group-relationships',
  BUILD_PROJECT_HAS_USER: 'build-project-user-relationships',
  BUILD_GROUP_HAS_USER: 'build-group-user-relationships',
  BUILD_GROUP_HAS_SUBGROUP: 'build-group-subgroup-relationships',
  BUILD_GROUP_HAS_PROJECT: 'build-group-project-relationships',
  BUILD_PROJECT_HAS_PR: 'build-project-merge-request-relationships',
  BUILD_USER_OPENED_PR: 'build-user-opened-merge-request-relationships',
  BUILD_USER_APPROVED_PR: 'build-user-approved-merge-request-relationships',
  PROJECT_LABELS: 'fetch-project-labels',
};

export const Entities = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'gitlab_account',
    _class: ['Account'],
  },
  USER: {
    resourceName: 'User',
    _type: 'gitlab_user',
    _class: ['User'],
  },
  GROUP: {
    resourceName: 'Group',
    _type: 'gitlab_group',
    _class: ['Group'],
  },
  FINDING: {
    resourceName: 'Finding',
    _type: 'gitlab_finding',
    _class: ['Finding'],
  },
  MERGE_REQUEST: {
    resourceName: 'Merge Request',
    _type: 'gitlab_merge_request',
    _class: ['CodeReview', 'PR'],
  },
  COMMIT: {
    resourceName: 'Commit',
    _type: 'gitlab_commit',
    _class: ['CodeCommit'],
  },
  PROJECT: {
    resourceName: 'Project',
    _type: 'gitlab_project',
    _class: ['CodeRepo', 'Project'],
  },
  LABEL: {
    resourceName: 'Label',
    _type: 'gitlab_label',
    _class: ['Record'],
  },
};

export const Relationships = {
  ACCOUNT_HAS_PROJECT: {
    _type: 'gitlab_account_has_project',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROJECT._type,
  },
  ACCOUNT_HAS_GROUP: {
    _type: 'gitlab_account_has_group',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.GROUP._type,
  },
  PROJECT_HAS_USER: {
    _type: 'gitlab_project_has_user',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  GROUP_HAS_SUBGROUP: {
    _type: 'gitlab_group_has_group',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.GROUP._type,
  },
  GROUP_HAS_USER: {
    _type: 'gitlab_group_has_user',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  GROUP_HAS_PROJECT: {
    _type: 'gitlab_group_has_project',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROJECT._type,
  },
  PROJECT_HAS_FINDING: {
    _type: 'gitlab_project_has_finding',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.FINDING._type,
  },
  PROJECT_HAS_PR: {
    _type: 'gitlab_project_has_merge_request',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.MERGE_REQUEST._type,
  },
  USER_OPENED_PR: {
    _type: 'gitlab_user_opened_merge_request',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.OPENED,
    targetType: Entities.MERGE_REQUEST._type,
  },
  USER_APPROVED_PR: {
    _type: 'gitlab_user_approved_merge_request',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.APPROVED,
    targetType: Entities.MERGE_REQUEST._type,
  },
  MR_HAS_COMMIT: {
    _type: 'gitlab_merge_request_has_commit',
    sourceType: Entities.MERGE_REQUEST._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.COMMIT._type,
  },
  PROJECT_HAS_LABEL: {
    _type: 'gitlab_project_has_label',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.LABEL._type,
  },
};
