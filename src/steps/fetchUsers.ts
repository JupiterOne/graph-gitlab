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

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch users',
  types: [USER_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);

    const users = await client.fetchUsers();

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
