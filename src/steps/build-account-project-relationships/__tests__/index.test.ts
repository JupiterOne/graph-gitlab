import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '..';
import entities from './__fixtures__/entities.json';

test('step data collection', async () => {
  const context = createMockStepExecutionContext({
    entities,
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'STRING_VALUE',
    },
  });

  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-account:5887285|has|gitlab-project:18463260',
      _type: 'gitlab_account_has_project',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-account:5887285',
      _toEntityKey: 'gitlab-project:18463260',
    }),
  ]);
});
