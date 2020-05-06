import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { GitLabUser } from '../provider/types';

export const STEP_ID = 'fetch-users';
export const USER_TYPE = 'gitlab_user';

const userExists = (users, id: number): boolean => {
  return users.find((user) => user.id === id);
};

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch users',
  types: [USER_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);

    const users = [];
    const groups = await client.fetchGroups();
    for (const group of groups) {
      const members = await client.fetchGroupMembers(group.id);
      members.forEach((member) => {
        if (!userExists(users, member.id)) {
          users.push(member);
        }
      });
    }

    console.log('users', users);
    await jobState.addEntities(users.map(createUserEntity));
  },
};

export function createUserEntity(user: GitLabUser): Entity {
  const id = createUserEntityIdentifier(user.id);

  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _key: id,
        _type: USER_TYPE,
        _class: 'User',

        id,
        name: user.name,
        createdOn: new Date(user.created_at).getTime(),
      },
    },
  });
}

const USER_ID_PREFIX = 'gitlab-user';
export function createUserEntityIdentifier(id: number): string {
  return `${USER_ID_PREFIX}:${id}`;
}

export default step;
