import { createMockStepExecutionContext } from '../../../test';

import * as provider from '../../provider';
import step from '../buildUserProjectsRelationships';
import entities from './__fixtures__/userProjectsEntities.json';

provider.createGitlabClient = jest.fn().mockReturnValue({
  fetchProjectMembers: (projectId: number) => {
    if (projectId === 1) {
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
      _key: 'gitlab-user:1|manages|gitlab-project:1',
      _type: 'gitlab_user_manages_project',
      _class: 'MANAGES',
      _fromEntityKey: 'gitlab-user:1',
      _toEntityKey: 'gitlab-project:1',
      displayName: 'MANAGES',
    }),
  ]);
});
