import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as PROJECT_STEP, GROUP_TYPE } from './fetchGroups';
import {
  STEP_ID as USER_STEP,
  USER_TYPE,
  createUserEntityIdentifier,
} from './fetchUsers';
import { createGitlabClient } from '../provider';

const step: IntegrationStep = {
  id: 'build-group-user-relationships',
  name: 'Build group user relationships',
  types: ['gitlab_group_has_user'],
  dependsOn: [PROJECT_STEP, USER_STEP],
  async executionHandler({
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const userIdMap = await createUserIdMap(jobState);

    await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
      const [, id] = group.id.toString().split(':');
      const groupMembers = await client.fetchGroupMembers(parseInt(id, 10));

      if (groupMembers.length > 0) {
        await jobState.addRelationships(
          groupMembers.map((member) =>
            createGroupUserRelationship(
              group,
              userIdMap.get(createUserEntityIdentifier(member.id)),
            ),
          ),
        );
      }
    });
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

export function createGroupUserRelationship(
  group: Entity,
  user: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: group,
    to: user,
  });
}
