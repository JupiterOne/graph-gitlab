import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '../';
import { Recording, setupRecording } from '../../../../test';
import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'project_merge_requests',
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
      _key: 'gitlab-project:18463260|has|gitlab-merge-request:18463260',
      _type: 'gitlab_project_has_merge_request',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-project:18463260',
      _toEntityKey: 'gitlab-merge-request:18463260',
    }),
  ]);
});
