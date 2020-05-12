import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import {
  STEP_ID as MERGE_REQUEST_STEP,
  MERGE_REQUEST_TYPE,
} from '../fetch-merge-requests';
import {
  STEP_ID as USER_STEP,
  USER_TYPE,
  createUserEntityIdentifier,
} from '../fetch-users';
import { createGitlabClient } from '../../provider';
import { ClientCreator } from '../../provider';

export function createStep(clientCreator: ClientCreator): IntegrationStep {
  return {
    id: 'build-user-approved-merge-request-relationships',
    name: 'Build user approved merge_request relationships',
    types: ['gitlab_user_approved_merge_request'],
    dependsOn: [MERGE_REQUEST_STEP, USER_STEP],
    async executionHandler({
      jobState,
      instance,
    }: IntegrationStepExecutionContext): Promise<void> {
      const client = clientCreator(instance);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: MERGE_REQUEST_TYPE },
        async (mergeRequest) => {
          const [, projectId] = mergeRequest.projectId.toString().split(':');

          const approvals = await client.fetchMergeRequestApprovals(
            parseInt(projectId, 10),
            mergeRequest.iid as number,
          );

          if (!approvals || !approvals.approved) {
            return;
          }

          const approvedByUsers = approvals.approved_by.map(
            (element) => element.user.id,
          );

          if (approvedByUsers.length > 0) {
            await jobState.addRelationships(
              approvedByUsers.map((user) =>
                createUserApprovedPrRelationship(
                  userIdMap.get(createUserEntityIdentifier(user)),
                  mergeRequest,
                ),
              ),
            );
          }
        },
      );
    },
  };
}

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: USER_TYPE }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default createStep((instance) => createGitlabClient(instance));

export function createUserApprovedPrRelationship(
  user: Entity,
  mergeRequest: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'APPROVED',
    from: user,
    to: mergeRequest,
  });
}
