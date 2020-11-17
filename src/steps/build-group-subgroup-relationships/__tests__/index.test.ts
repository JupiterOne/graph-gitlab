import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '../';
import { Recording, setupRecording } from '../../../../test';
import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'group_subgroups',
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
      _key: 'gitlab-group:7799803|has|gitlab-group:7799819',
      _type: 'gitlab_group_has_group',
      _class: 'HAS',
      _fromEntityKey: 'gitlab-group:7799803',
      _toEntityKey: 'gitlab-group:7799819',
    }),
  ]);
});
