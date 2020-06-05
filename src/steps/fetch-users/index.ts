import {
  Entity,
  IntegrationStep,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { GitLabUser, GitLabUserRef } from '../../provider/types';
import { STEP_ID as GROUP_STEP, GROUP_TYPE } from '../fetch-groups';
import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from '../fetch-projects';
import { GitlabIntegrationConfig } from '../../types';

export const STEP_ID = 'fetch-users';
export const USER_TYPE = 'gitlab_user';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: STEP_ID,
  name: 'Fetch users',
  types: [USER_TYPE],
  dependsOn: [GROUP_STEP, PROJECT_STEP],
  async executionHandler({
    instance,
    jobState,
  }) {
    const client = createGitlabClient(instance);

    const usersMap: {
      [number: string]: GitLabUserRef;
    } = {};

    await jobState.iterateEntities({ _type: GROUP_TYPE }, async (group) => {
      const members = await client.fetchGroupMembers(
        parseInt(group.id as string, 10),
      );

      members.forEach((member) => (usersMap[member.id] = member));
    });

    await jobState.iterateEntities({ _type: PROJECT_TYPE }, async (project) => {
      const members = await client.fetchProjectMembers(
        parseInt(project.id as string, 10),
      );

      members.forEach((member) => (usersMap[member.id] = member));
    });

    const users: GitLabUser[] = await Promise.all(
      Object.values(usersMap).map((userRef) => client.fetchUser(userRef.id)),
    );

    await jobState.addEntities(users.map(createUserEntity));
  },
};

export function createUserEntity(user: GitLabUser): Entity {
  const key = createUserEntityIdentifier(user.id);

  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _key: key,
        _type: USER_TYPE,
        _class: 'User',

        id: user.id.toString(),
        name: user.name,
        createdOn: new Date(user.created_at).getTime(),
        webLink: user.web_url,
        username: user.username,
        state: user.state,
        email: user.email,
        publicEmail: user.public_email,
        isAdmin: user.is_admin,
        canCreateGroup: user.can_create_group,
        canCreateProject: user.can_create_project,
        twoFactorEnabled: user.two_factor_enabled,
        external: user.external,
        privateProfile: user.private_profile,
        trial: user.trial,
      },
    },
  });
}

const USER_ID_PREFIX = 'gitlab-user';
export function createUserEntityIdentifier(id: number): string {
  return `${USER_ID_PREFIX}:${id}`;
}

export default step;
