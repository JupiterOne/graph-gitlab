import { createMockStepExecutionContext } from '../../../test';

import * as provider from '../../provider';
import step from '../buildUserApprovedMergeRequestRelationships';
import entities from './__fixtures__/userApprovedMergeRequestEntities.json';

provider.createGitlabClient = jest.fn().mockReturnValue({
  fetchMergeRequestApprovals: async (
    projectId: number,
    mergeRequestId: number,
  ) => {
    if (mergeRequestId === 1 && projectId === 1) {
      return Promise.resolve(entities.filter((e) => e.iid)[0]);
    }

    return Promise.resolve({});
  },
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-user:1|approved|gitlab-merge-request:1',
      _type: 'gitlab_user_approved_merge_request',
      _class: 'APPROVED',
      _fromEntityKey: 'gitlab-user:1',
      _toEntityKey: 'gitlab-merge-request:1',
    }),
  ]);
});
