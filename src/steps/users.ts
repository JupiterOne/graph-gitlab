import {
  IntegrationProviderAPIError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';
import { sleep } from '@lifeomic/attempt';

import { Entities, Steps } from '../constants';
import { createUserEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabUser } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';

export const ONE_MINUTE_IN_MS = 60_000;

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
    let userDetails: GitLabUser;
    try {
      userDetails = await client.fetchUser(userId);
    } catch (err) {
      if ((err as IntegrationProviderAPIError).status === 429) {
        /**
         * Wait 10 minutes, then attempt the request again.
         *
         * Also alert the user that we've apparently encountered a 10-minute
         * rate limit on the `/users/<user-id>` endpoint, and guide them to
         * documentation about increasing their per-user rate limit (if possible)
         *
         * See https://docs.gitlab.com/ee/user/admin_area/settings/rate_limit_on_users_api.html
         */
        logger.publishWarnEvent({
          name: 'warn_rate_limit_encountered' as IntegrationWarnEventName,
          description: `Encountered rate limit on '/users/${userId}' endpoint, which has a 10-minute rate limit reset (see https://docs.gitlab.com/ee/user/admin_area/settings/rate_limit_on_users_api.html). Sleeping for 10 minutes before re-attempting '/users/${userId}' endpoint`,
        });
        await sleep(10 * ONE_MINUTE_IN_MS);
        userDetails = await client.fetchUser(userId);
      } else {
        throw err;
      }
    }
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
