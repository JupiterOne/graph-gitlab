import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import {
  STEP_ID as GROUP_STEP,
  GROUP_TYPE,
  createGroupEntityIdentifier,
} from './fetchGroups';

const step: IntegrationStep = {
  id: 'build-group-subgroup-relationships',
  name: 'Build group subgroup relationships',
  types: ['gitlab_group_has_subgroup'],
  dependsOn: [GROUP_STEP],
  async executionHandler({
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const groupIdMap = await createGroupIdMap(jobState);

    for (const [id, group] of groupIdMap.entries()) {
      const [, subgroupId] = id.split(':');
      const subgroups = await client.fetchGroupSubgroups(
        parseInt(subgroupId, 10),
      );

      if (subgroups.length > 0) {
        await jobState.addRelationships(
          subgroups.map((subgroup) =>
            createGroupProjectRelationship(
              group,
              groupIdMap.get(createGroupEntityIdentifier(subgroup.id)),
            ),
          ),
        );
      }
    }
  },
};

async function createGroupIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const groupIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: GROUP_TYPE }, (group) => {
    groupIdMap.set(group.id as string, group);
  });

  return groupIdMap;
}

export default step;

export function createGroupProjectRelationship(
  group: Entity,
  subgroup: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: group,
    to: subgroup,
  });
}
