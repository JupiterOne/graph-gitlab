import { createMockStepExecutionContext } from '../../../test';

import step from '../buildGroupSubgroupRelationships';
import entities from './__fixtures__/groupEntities.json';

test('step data collection', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-group:1|has|gitlab-group:2',
      _type: 'gitlab_group_has_group',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-group:1',
      _toEntityKey: 'gitlab-group:2',
    }),
  ]);
});
