import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchAccounts from './steps/fetch-accounts';
import fetchGroups from './steps/fetch-groups';
import fetchUsers from './steps/fetch-users';
import fetchProjects from './steps/fetch-projects';
import fetchMergeRequests from './steps/fetch-merge-requests';

import buildAccountGroupRelationships from './steps/build-account-group-relationships';
import buildAccountProjectRelationships from './steps/build-account-project-relationships';
import buildGroupSubgroupRelationships from './steps/build-group-subgroup-relationships';
import buildGroupUserRelationships from './steps/build-group-user-relationships';
import buildProjectUserRelationships from './steps/build-project-user-relationships';
import buildProjectMergeRequestRelationships from './steps/build-project-merge-requests-relationships';
import buildUserOpenedMergeRequestRelationships from './steps/build-user-opened-merge-request-relationships';
import buildUserApprovedMergeRequestRelationships from './steps/build-user-approved-merge-request-relationships';
import { GitlabIntegrationConfig } from './types';

export const invocationConfig: IntegrationInvocationConfig<GitlabIntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [
    fetchAccounts,
    fetchGroups,
    fetchUsers,
    fetchProjects,
    fetchMergeRequests,
    buildAccountGroupRelationships,
    buildAccountProjectRelationships,
    buildGroupSubgroupRelationships,
    buildGroupUserRelationships,
    buildProjectUserRelationships,
    buildProjectMergeRequestRelationships,
    buildUserOpenedMergeRequestRelationships,
    buildUserApprovedMergeRequestRelationships,
  ],
};
