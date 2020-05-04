import { createMockStepExecutionContext } from '../../../test';

import step from '../buildAccountUserRelationships';

import entities from './__fixtures__/accountUserEntities.json';

test('step data collection', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-account:1|manages|gitlab-user:2',
      _type: 'gitlab_account_manages_user',
      _class: 'MANAGES',
      _fromEntityKey: 'gitlab-account:1',
      _toEntityKey: 'gitlab-user:2',
    }),
  ]);
});
