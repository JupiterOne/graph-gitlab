import { createMockStepExecutionContext } from '../../../test';

import { createStep } from '../buildUserApprovedMergeRequestRelationships';
import {
  entities,
  responses,
} from './__fixtures__/userApprovedMergeRequestEntities.json';
import { GitlabClient } from '../../provider/GitlabClient';
import { GitLabMergeRequestApproval } from '../../provider/types';

test('step data collection', async () => {
  const mockClient: Partial<GitlabClient> = {
    fetchMergeRequestApprovals: async (
      projectId: number,
      mergeRequestId: number,
    ) => {
      if (mergeRequestId === 1 && projectId === 1) {
        const [first] = responses.filter((e) => e.iid);

        return Promise.resolve(first as GitLabMergeRequestApproval);
      }

      return Promise.resolve({} as GitLabMergeRequestApproval);
    },
  };

  const step = createStep(() => mockClient as GitlabClient);
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
