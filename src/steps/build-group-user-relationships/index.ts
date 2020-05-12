import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as PROJECT_STEP, GROUP_TYPE } from '../fetch-groups';
import { STEP_ID as USER_STEP, USER_TYPE } from '../fetch-users';
import { createGitlabClient, ClientCreator } from '../../provider';

export function createStep(clientCreator: ClientCreator): IntegrationStep {
  return {
    id: 'build-group-user-relationships',
    name: 'Build group user relationships',
    types: ['gitlab_group_has_user'],
    dependsOn: [PROJECT_STEP, USER_STEP],
    async executionHandler({
      jobState,
      instance,
    }: IntegrationStepExecutionContext): Promise<void> {
      const client = clientCreator(instance);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
        const groupMembers = await client.fetchGroupMembers(
          parseInt(group.id as string, 10),
        );

        if (groupMembers.length > 0) {
          await jobState.addRelationships(
            groupMembers.map((member) =>
              createGroupUserRelationship(
                group,
                userIdMap.get(member.id.toString()),
              ),
            ),
          );
        }
      });
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
