import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '../';
import { Recording, setupRecording } from '../../../../test';
import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'user_approved_merge_requests',
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
      _key: 'gitlab-user:5887285|approved|gitlab-merge-request:57366118',
      _type: 'gitlab_user_approved_merge_request',
      _class: 'APPROVED',
      _fromEntityKey: 'gitlab-user:5887285',
      _toEntityKey: 'gitlab-merge-request:57366118',
    }),
  ]);
});
