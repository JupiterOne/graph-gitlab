import { createMockStepExecutionContext } from '../../../test';

import step from '../buildUserApprovedMergeRequestRelationships';

import entities from './__fixtures__/userApprovedMergeRequestEntities.json';

test('step data collection', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-user:1|opened|gitlab-merge-request:1',
      _type: 'gitlab_user_opened_merge_request',
      _class: 'OPENED',
      _fromEntityKey: 'gitlab-user:1',
      _toEntityKey: 'gitlab-merge-request:1',
    }),
  ]);
});
