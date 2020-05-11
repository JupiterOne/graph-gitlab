import { createMockStepExecutionContext } from '../../../test';

import { createStep } from '../buildGroupUserRelationships';
import entities from './__fixtures__/groupUserEntities.json';
import { GitlabClient } from '../../provider/GitlabClient';
import { GitLabUserRef } from '../../provider/types';

test('step data collection', async () => {
  const mockClient: Partial<GitlabClient> = {
    fetchGroupMembers: async (groupId: number) => {
      if (groupId === 1) {
        return (entities
          .filter((e) => e._type === 'gitlab_user')
          .map((e) => ({
            ...e,
            id: parseInt(e.id.split(':')[1], 10),
          })) as unknown) as GitLabUserRef[];
      }

      return [] as GitLabUserRef[];
    },
  };

  const step = createStep(() => mockClient as GitlabClient);
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-group:1|has|gitlab-user:1',
      _type: 'gitlab_group_has_user',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-group:1',
      _toEntityKey: 'gitlab-user:1',
    }),
  ]);
});
