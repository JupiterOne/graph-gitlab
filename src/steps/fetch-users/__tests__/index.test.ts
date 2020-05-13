import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../../test';

import { GitLabUser } from '../../../provider/types';
import { createGitlabClient } from '../../../provider';
import step, { createUserEntity } from '..';
import { createProjectEntity } from '../../fetch-projects';
import { createGroupEntity } from '../../fetch-groups';

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
  const myContext = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });

  const provider = createGitlabClient(myContext.instance);
  const groups = await provider.fetchGroups();
  const projects = await provider.fetchProjects();

  const context = createMockStepExecutionContext({
    entities: [
      ...groups.map(createGroupEntity),
      ...projects.map(createProjectEntity),
    ],
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });

  await step.executionHandler(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: expect.stringMatching(/gitlab-user:[0-9]+/),
        _type: 'gitlab_user',
        _class: ['User'],
        _rawData: expect.any(Array),
        id: expect.stringMatching(/[0-9]+/),
        name: expect.any(String),
        webLink: expect.any(String),
        createdOn: expect.any(Number),
        username: expect.any(String),
        state: expect.any(String),
        publicEmail: expect.any(String),
      }),
    ]),
  );
});
