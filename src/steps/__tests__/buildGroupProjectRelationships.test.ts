import { createMockStepExecutionContext } from '../../../test';

import { createStep } from '../buildGroupProjectsRelationships';
import entities from './__fixtures__/groupProjectEntities.json';
import { GitlabClient } from '../../provider/GitlabClient';
import { GitLabProject } from '../../provider/types';

test('step data collection', async () => {
  const mockClient: Partial<GitlabClient> = {
    fetchGroupProjects: async (groupId: number) => {
      if (groupId === 1) {
        return (entities
          .filter((e) => e._type === 'gitlab_project')
          .map((e) => ({
            ...e,
            id: parseInt(e.id.split(':')[1], 10),
          })) as unknown) as GitLabProject[];
      }

      return [] as GitLabProject[];
    },
  };

  const step = createStep(() => mockClient as GitlabClient);
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
