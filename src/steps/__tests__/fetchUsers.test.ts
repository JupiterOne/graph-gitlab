import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../test';

import { GitLabUser } from '../../provider/types';
import { createGitlabClient } from '../../provider';
import step, { createUserEntity } from '../fetchUsers';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'users',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('User fetching', async () => {
  const context = createMockStepExecutionContext();
  const provider = createGitlabClient(context.instance);

  const results = await provider.fetchUsers();

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Administrator',
        username: 'root',
      }),
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Admin User',
        username: 'admin_user',
      }),
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Regular User',
        username: 'regular_user',
      }),
    ]),
  );
});

test('User entity conversion', async () => {
  const user = {
    id: 1,
    name: 'Administrator',
    username: 'root',
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabUser;

  const entity = createUserEntity(user);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-user:1',
      _type: 'gitlab_user',
      _class: ['User'],
      id: 'gitlab-user:1',
      name: 'Administrator',
      createdOn: expect.any(Number),
      _rawData: [
        {
          name: 'default',
          rawData: user,
        },
      ],
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(3);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: 'gitlab-user:1',
      }),
      expect.objectContaining({
        _key: 'gitlab-user:2',
      }),
      expect.objectContaining({
        _key: 'gitlab-user:3',
      }),
    ]),
  );
});
