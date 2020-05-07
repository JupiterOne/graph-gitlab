import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { GitLabGroup } from '../provider/types';

export const STEP_ID = 'fetch-groups';
export const GROUP_TYPE = 'gitlab_group';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch groups',
  types: [GROUP_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const groups = await client.fetchGroups();
    await jobState.addEntities(groups.map(createGroupEntity));
  },
};

export function createGroupEntity(group: GitLabGroup): Entity {
  const id = createGroupEntityIdentifier(group.id);

  return createIntegrationEntity({
    entityData: {
      source: group,
      assign: {
        _key: id,
        _type: GROUP_TYPE,
        _class: 'Group',

        id,
        parentGroupId: createGroupEntityIdentifier(group.parent_id),
        name: group.name,
        createdOn: new Date(group.created_at).getTime(),
      },
    },
  });
}

const GROUP_ID_PREFIX = 'gitlab-group';
export function createGroupEntityIdentifier(id?: number): string {
  return id ? `${GROUP_ID_PREFIX}:${id}` : undefined;
}

export default step;
