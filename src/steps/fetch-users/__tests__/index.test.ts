import step, { createUserEntity } from '../';
import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '../../../../test';
import { GitLabUser } from '../../../provider/types';
import fetchGroups from '../../fetch-groups';
import fetchProjects from '../../fetch-projects';

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

test('User entity conversion', async () => {
  const user = {
    id: 1,
    name: 'Administrator',
    username: 'root',
    created_at: '2020-01-01T00:00:00.000Z',
    web_url: 'https://url',
    state: 'state-value',
    email: 'some@email.com',
    public_email: 'public@email.com',
    is_admin: true,
    can_create_group: true,
    can_create_project: true,
    two_factor_enabled: false,
    external: false,
    private_profile: false,
    trial: false,
  } as GitLabUser;

  const entity = createUserEntity(user);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-user:1',
      _type: 'gitlab_user',
      _class: ['User'],
      _rawData: expect.any(Array),
      id: '1',
      createdOn: expect.any(Number),
      displayName: 'Administrator',
      email: 'some@email.com',
      canCreateGroup: true,
      canCreateProject: true,
      external: false,
      isAdmin: true,
      name: expect.any(String),
      privateProfile: false,
      publicEmail: 'public@email.com',
      state: 'state-value',
      trial: false,
      twoFactorEnabled: false,
      username: 'root',
      webLink: 'https://url',
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

  await fetchGroups.executionHandler(context);
  await fetchProjects.executionHandler(context);
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);
  expect(context.jobState.collectedRelationships.length).toBeGreaterThanOrEqual(
    1,
  );

  expect(
    context.jobState.collectedEntities.filter((e) => e._class.includes('User')),
  ).toMatchGraphObjectSchema({
    _class: 'User',
    schema: {
      additionalProperties: false,
      properties: {
        _class: ['User'],
        _type: { const: 'gitlab_user' },
        _rawData: { type: 'array', items: { type: 'object' } },
        id: { pattern: '[0-9]+' },
        name: { type: 'string' },
        webLink: { type: 'string' },
        createdOn: { type: 'number' },
        username: { type: 'string' },
        state: { type: 'string' },
        publicEmail: { type: 'string' },
        isAdmin: { type: 'boolean' },
        canCreateGroup: { type: 'boolean' },
        canCreateProject: { type: 'boolean' },
        twoFactorEnabled: { type: 'boolean' },
        external: { type: 'boolean' },
        privateProfile: { type: 'boolean' },
        trial: { type: 'boolean' },
      },
    },
  });
});
