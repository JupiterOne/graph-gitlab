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
} from '../fetchMergeRequests';
import { STEP_ID as USER_STEP, USER_TYPE } from '../fetchUsers';

const step: IntegrationStep = {
  id: 'build-user-opened-merge-request-relationships',
  name: 'Build user opened merge_request relationships',
  types: ['gitlab_user_opened_merge_request'],
  dependsOn: [MERGE_REQUEST_STEP, USER_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const userIdMap = await createUserIdMap(jobState);

    await jobState.iterateEntities(
      { _type: MERGE_REQUEST_TYPE },
      async (mergeRequest) => {
        const openedUser = userIdMap.get(mergeRequest.authorId as string);

        if (openedUser) {
          await jobState.addRelationships([
            createUserOpenedPrRelationship(openedUser, mergeRequest),
          ]);
        }
      },
    );
  },
};

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: USER_TYPE }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default step;

export function createUserOpenedPrRelationship(
  user: Entity,
  mergeRequest: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'OPENED',
    from: user,
    to: mergeRequest,
  });
}
