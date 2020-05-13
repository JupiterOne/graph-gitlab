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
    name: 'user_opened_merge_requests',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
    entities,
  });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _key: 'gitlab-user:5887285|opened|gitlab-merge-request:58110137',
      _type: 'gitlab_user_opened_merge_request',
      _class: 'OPENED',
      _fromEntityKey: 'gitlab-user:5887285',
      _toEntityKey: 'gitlab-merge-request:58110137',
    }),
  ]);
});
