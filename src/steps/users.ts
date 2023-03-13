import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { Entities, Steps } from '../constants';
import { createUserEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitlabIntegrationConfig } from '../types';

export async function fetchUsers({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config, logger);

  const userIds = new Set<number>();

  await jobState.iterateEntities(
    { _type: Entities.GROUP._type },
    async (group) => {
      const members = await client.fetchGroupMembers(
        parseInt(group.id as string, 10),
      );

      for (const member of members) {
        userIds.add(member.id);
      }
    },
  );

  await jobState.iterateEntities(
    { _type: Entities.PROJECT._type },
    async (project) => {
      const members = await client.fetchProjectMembers(
        parseInt(project.id as string, 10),
      );

      for (const member of members) {
        userIds.add(member.id);
      }
    },
  );

  for (const userId of userIds) {
    const userDetails = await client.fetchUser(userId);
    await jobState.addEntity(createUserEntity(userDetails));
  }
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
