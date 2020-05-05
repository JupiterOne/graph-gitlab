import { createMockStepExecutionContext } from '../../../test';

import * as provider from '../../provider';
import step from '../buildGroupUserRelationships';
import entities from './__fixtures__/groupUserEntities.json';

provider.createGitlabClient = jest.fn().mockReturnValue({
  fetchGroupMembers: (groupId: number) => {
    if (groupId === 1) {
      return entities
        .filter((e) => e._type === 'gitlab_user')
        .map((e) => ({
          ...e,
          id: parseInt(e.id.split(':')[1], 10),
        }));
    }

    return [];
  },
});

test('step data collection', async () => {
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
