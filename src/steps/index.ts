import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';

import { GitlabIntegrationConfig } from '../types';
import accountGroupStep from './build-account-group-relationships';
import accountProjectStep from './build-account-project-relationships';
import groupSubgroupStep from './build-group-subgroup-relationships';
import groupUserStep from './build-group-user-relationships';
import projectMergeRequestStep from './build-project-merge-requests-relationships';
import projectUserStep from './build-project-user-relationships';
import userOpenedMergeRequestStep from './build-user-opened-merge-request-relationships';
import accountStep from './fetch-accounts';
import groupStep from './fetch-groups';
import { mergeRequestSteps } from './merge-requests';
import { projectSteps } from './projects';
import { userSteps } from './users';

const integrationSteps: Step<
  IntegrationStepExecutionContext<GitlabIntegrationConfig>
>[] = [
  accountStep,
  groupStep,
  ...projectSteps,
  ...userSteps,
  projectUserStep,
  accountGroupStep,
  accountProjectStep,
  groupSubgroupStep,
  groupUserStep,
  ...mergeRequestSteps,
  projectMergeRequestStep,
  userOpenedMergeRequestStep,
];

export { integrationSteps };
