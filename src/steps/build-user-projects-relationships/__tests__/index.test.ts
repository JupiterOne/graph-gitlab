import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../../test';

import step from '..';
import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'user_projects',
  });
});

afterEach(async () => {
  await recording.stop();
});

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
  expect(context.jobState.collectedRelationships).toHaveLength(2);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-user:5887402|manages|gitlab-project:18463260',
      _type: 'gitlab_user_manages_project',
      _class: 'MANAGES',
      _fromEntityKey: 'gitlab-user:5887402',
      _toEntityKey: 'gitlab-project:18463260',
      displayName: 'MANAGES',
    }),
    expect.objectContaining({
      _key: 'gitlab-user:5887285|manages|gitlab-project:18463260',
      _type: 'gitlab_user_manages_project',
      _class: 'MANAGES',
      _fromEntityKey: 'gitlab-user:5887285',
      _toEntityKey: 'gitlab-project:18463260',
      displayName: 'MANAGES',
    }),
  ]);
});
