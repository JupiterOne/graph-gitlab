import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createGitlabClient } from '../../provider';
import { ClientCreator } from '../../provider';
import { GitlabIntegrationConfig } from '../../types';
import { Steps, Entities, Relationships } from '../../constants';

export function createStep(
  clientCreator: ClientCreator,
): IntegrationStep<GitlabIntegrationConfig> {
  return {
    id: Steps.BUILD_USER_APPROVED_PR,
    name: 'Build user approved merge_request relationships',
    entities: [],
    relationships: [Relationships.USER_APPROVED_PR],
    dependsOn: [Steps.MERGE_REQUESTS, Steps.USERS],
    async executionHandler({
      jobState,
      instance,
    }: IntegrationStepExecutionContext<GitlabIntegrationConfig>): Promise<
      void
    > {
      const client = clientCreator(instance);
      const userIdMap = await createUserIdMap(jobState);

      await jobState.iterateEntities(
        { _type: Entities.MERGE_REQUEST._type },
        async (mergeRequest) => {
          const approvals = await client.fetchMergeRequestApprovals(
            parseInt(mergeRequest.projectId as string, 10),
            mergeRequest.iid as number,
          );

          if (!approvals || !approvals.approved) {
            return;
          }

          const approvedByUsers = approvals.approved_by.map(
            (element) => element.user.id,
          );

          if (approvedByUsers.length > 0) {
            await jobState.addRelationships(
              approvedByUsers.map((userId) =>
                createUserApprovedPrRelationship(
                  userIdMap.get(userId.toString()) as Entity,
                  mergeRequest,
                ),
              ),
            );
          }
        },
      );
    },
  };
}

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: Entities.USER._type }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default createStep((instance) => createGitlabClient(instance));

export function createUserApprovedPrRelationship(
  user: Entity,
  mergeRequest: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.APPROVED,
    from: user,
    to: mergeRequest,
  });
}
