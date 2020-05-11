import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../test';

import { GitLabUser } from '../../provider/types';
import { createGitlabClient } from '../../provider';
import step, { createAccountEntity } from '../fetchAccounts';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'accounts',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('Account fetching', async () => {
  const context = createMockStepExecutionContext();

  // Special case when .env is not provided
  if (context.instance.config.baseUrl === 'STRING_VALUE') {
    context.instance.config.baseUrl = 'https://gitlab.com';
  }
  const provider = createGitlabClient(context.instance);

  const results = await provider.fetchAccount();

  expect(results).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
    }),
  );
});

test('Account entity conversion', async () => {
  const account = {
    id: 1,
    username: 'account',
    name: 'account',
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabUser;

  const entity = createAccountEntity(account);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-account:1',
      _type: 'gitlab_account',
      _class: ['User'],
      id: 'gitlab-account:1',
      name: 'account',
      createdOn: expect.any(Number),
      displayName: 'account',
      _rawData: [
        {
          name: 'default',
          rawData: account,
        },
      ],
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext();

  // Special case when .env is not provided
  if (context.instance.config.baseUrl === 'STRING_VALUE') {
    context.instance.config.baseUrl = 'https://gitlab.com';
  }
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      _key: expect.stringMatching(/gitlab-account:[0-9]+/),
      _class: ['User'],
      _type: 'gitlab_account',
      createdOn: expect.any(Number),
      displayName: expect.any(String),
      email: expect.any(String),
      id: expect.stringMatching(/gitlab-account:[0-9]+/),
      name: expect.any(String),
      username: expect.any(String),
    }),
  ]);
});
