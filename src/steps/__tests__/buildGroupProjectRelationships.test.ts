import { createMockStepExecutionContext } from '../../../test';

import * as provider from '../../provider';
import step from '../buildGroupProjectsRelationships';
import entities from './__fixtures__/groupProjectEntities.json';

provider.createGitlabClient = jest.fn().mockReturnValue({
  fetchGroupProjects: (groupId: number) => {
    if (groupId === 1) {
      return entities
        .filter((e) => e._type === 'gitlab_project')
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
      _key: 'gitlab-group:1|has|gitlab-project:1',
      _type: 'gitlab_group_has_project',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-group:1',
      _toEntityKey: 'gitlab-project:1',
    }),
  ]);
});
