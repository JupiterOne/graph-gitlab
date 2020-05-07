import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { GitLabUser, GitLabUserRef } from '../provider/types';
import { STEP_ID as GROUP_STEP, GROUP_TYPE } from './fetchGroups';
import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from './fetchProjects';

export const STEP_ID = 'fetch-users';
export const USER_TYPE = 'gitlab_user';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch users',
  types: [USER_TYPE],
  dependsOn: [GROUP_STEP, PROJECT_STEP],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);

    const usersMap: {
      [number: string]: GitLabUserRef;
    } = {};

    await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
      const [, id] = group.id.toString().split(':');
      const members = await client.fetchGroupMembers(parseInt(id, 10));

      members.forEach((member) => (usersMap[member.id] = member));
    });

    await jobState.iterateEntities({ _type: PROJECT_TYPE }, async (project) => {
      const [, id] = project.id.toString().split(':');
      const members = await client.fetchProjectMembers(parseInt(id, 10));

      members.forEach((member) => (usersMap[member.id] = member));
    });

    const users: GitLabUser[] = await Promise.all(
      Object.values(usersMap).map((userRef) => client.fetchUser(userRef.id)),
    );

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
