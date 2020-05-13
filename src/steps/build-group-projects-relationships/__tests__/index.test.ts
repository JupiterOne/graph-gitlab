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
    name: 'group_projects',
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
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-group:7799819|has|gitlab-project:18463260',
      _type: 'gitlab_group_has_project',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-group:7799819',
      _toEntityKey: 'gitlab-project:18463260',
    }),
  ]);
});
