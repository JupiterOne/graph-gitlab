import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps } from '../constants';
import { createUserEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabUser, GitLabUserRef } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';

export async function fetchUsers({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config, logger);

  const usersMap: {
    [number: string]: GitLabUserRef;
  } = {};

  await jobState.iterateEntities(
    { _type: Entities.GROUP._type },
    async (group) => {
      const members = await client.fetchGroupMembers(
        parseInt(group.id as string, 10),
      );

      members.forEach((member) => (usersMap[member.id] = member));
    },
  );

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (project) => {
      const members = await client.fetchProjectMembers(
        parseInt(project.id as string, 10),
      );

      members.forEach((member) => (usersMap[member.id] = member));
    },
  );

  const users: GitLabUser[] = await Promise.all(
    Object.values(usersMap).map((userRef) => client.fetchUser(userRef.id)),
  );

  await jobState.addEntities(users.map(createUserEntity));
}

export const userSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.USERS,
    name: 'Fetch users',
    entities: [Entities.USER],
    relationships: [],
    dependsOn: [Steps.GROUPS, Steps.PROJECTS],
    executionHandler: fetchUsers,
  },
];
