import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { STEP_ID as GROUP_STEP, GROUP_TYPE } from '../fetchGroups';

const step: IntegrationStep = {
  id: 'build-group-subgroup-relationships',
  name: 'Build group subgroup relationships',
  types: ['gitlab_group_has_subgroup'],
  dependsOn: [GROUP_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const groupIdMap = await createGroupIdMap(jobState);

    for (const group of groupIdMap.values()) {
      if (group.parentGroupId) {
        const parentGroup = groupIdMap.get(group.parentGroupId as string);

        await jobState.addRelationships([
          createGroupProjectRelationship(parentGroup, group),
        ]);
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
