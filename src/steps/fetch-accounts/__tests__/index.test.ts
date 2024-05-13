import {
  createMockIntegrationLogger,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';

import step from '../';
import { Recording, setupRecording } from '../../../../test';
import { createGitlabClient } from '../../../provider';
import { GitLabUser } from '../../../provider/types';
import { createAccountEntity } from '../../../converters';

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
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });
  const provider = createGitlabClient(
    context.instance.config,
    createMockIntegrationLogger(),
  );

  const results = await provider.fetchTokenOwner();

  expect(results).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
    }),
  );
});

test('Account entity conversion', () => {
  const tokenOwner = {
    id: 1,
    username: 'account',
    name: 'account',
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabUser;

  const systemVersion = {
    version: 'testv1',
    revision: '234',
    enterprise: false,
  };

  const entity = createAccountEntity(tokenOwner, systemVersion);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-account-version:testv1',
      _type: 'gitlab_account',
      _class: ['Account'],
      id: '1',
      name: 'account',
      displayName: 'account',
      enterprise: false,
      revision: '234',
      version: 'testv1',
      _rawData: [
        {
          name: 'default',
          rawData: { tokenOwner, systemVersion },
        },
      ],
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);
  expect(context.jobState.collectedEntities).toMatchSnapshot();
});
