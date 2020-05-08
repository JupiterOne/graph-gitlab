import { createMockStepExecutionContext } from '../../../test';

import step from '../buildProjectMergeRequestRelationships';
import entities from './__fixtures__/projectMergeRequestEntities.json';

test('step data collection', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-project:1|has|gitlab-merge-request:1',
      _type: 'gitlab_project_has_merge_request',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-project:1',
      _toEntityKey: 'gitlab-merge-request:1',
    }),
  ]);
});
