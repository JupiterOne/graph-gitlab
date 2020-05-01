import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../test';

import { GitLabGroup } from '../../provider/types';
import { createGitlabClient } from '../../provider';
import step, { createGroupEntity } from '../fetchGroups';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'groups',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('Group fetching', async () => {
  const context = createMockStepExecutionContext();
  const provider = createGitlabClient(context.instance);

  const results = await provider.fetchGroups();

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: 'TopLevelGroup',
        parent_id: null,
      }),
      expect.objectContaining({
        id: expect.any(Number),
        name: 'ChildGroup',
        parent_id: expect.any(Number),
      }),
    ]),
  );
});

test('Group entity conversion', async () => {
  const group = {
    id: 1,
    parent_id: 2,
    name: 'group',
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabGroup;

  const entity = createGroupEntity(group);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-group:1',
      _type: 'gitlab_group',
      _class: ['Group'],
      id: 'gitlab-group:1',
      name: 'group',
      createdOn: expect.any(Number),
      _rawData: [
        {
          name: 'default',
          rawData: group,
        },
      ],
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: 'gitlab-group:6',
      }),
      expect.objectContaining({
        _key: 'gitlab-group:4',
      }),
    ]),
  );
});
