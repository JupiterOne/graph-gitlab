import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Steps, Entities, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.BUILD_GROUP_HAS_SUBGROUP,
  name: 'Build group subgroup relationships',
  entities: [],
  relationships: [Relationships.GROUP_HAS_SUBGROUP],
  dependsOn: [Steps.GROUPS],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const groupIdMap = await createGroupIdMap(jobState);

    for (const group of groupIdMap.values()) {
      if (group.parentGroupId) {
        const parentGroup = groupIdMap.get(
          group.parentGroupId as string,
        ) as Entity;

        await jobState.addRelationships([
          createGroupSubgroupRelationship(parentGroup, group),
        ]);
      }
    }
  },
};

async function createGroupIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const groupIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: Entities.GROUP._type }, (group) => {
    groupIdMap.set(group.id as string, group);
  });

  return groupIdMap;
}

export default step;

export function createGroupSubgroupRelationship(
  group: Entity,
  subgroup: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: group,
    to: subgroup,
  });
}
