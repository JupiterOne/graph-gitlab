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
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });
  const provider = createGitlabClient(context.instance);

  const results = await provider.fetchGroups();

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        path: expect.any(String),
        description: expect.any(String),
        web_url: expect.any(String),
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
    path: 'path',
    description: 'description',
    visibility: 'visibility',
    share_with_group_lock: true,
    require_two_factor_authentication: true,
    two_factor_grace_period: 7,
    project_creation_level: 'project_creation_level',
    auto_devops_enabled: true,
    subgroup_creation_level: 'subgroup_creation_level',
    emails_disabled: true,
    mentions_disabled: true,
    lfs_enabled: true,
    default_branch_protection: 1,
    web_url: 'https://url',
    request_access_enabled: true,
    full_name: 'full_name',
    full_path: 'full_path',
    file_template_project_id: 4,
  } as GitLabGroup;

  const entity = createGroupEntity(group);

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-group:1',
      _type: 'gitlab_group',
      _class: ['Group'],
      _rawData: expect.any(Array),
      id: 'gitlab-group:1',
      name: 'group',
      createdOn: expect.any(Number),
      path: 'path',
      description: 'description',
      visibility: 'visibility',
      shareWithGroupLock: true,
      requireTwoFactorAuthentication: true,
      twoFactorGracePeriod: 7,
      projectCreationLevel: 'project_creation_level',
      autoDevopsEnabled: true,
      subgroupCreationLevel: 'subgroup_creation_level',
      emailsDisabled: true,
      mentionsDisabled: true,
      lfsEnabled: true,
      defaultBranchProtection: 1,
      webUrl: 'https://url',
      requestAccessEnabled: true,
      fullName: 'full_name',
      fullPath: 'full_path',
      fileTemplateProjectId: 4,
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

  expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: expect.stringMatching(/gitlab-group:[0-9]+/),
        _type: 'gitlab_group',
        _class: ['Group'],
        _rawData: expect.any(Array),
        id: expect.any(String),
        name: expect.any(String),
        createdOn: expect.any(Number),
        path: expect.any(String),
        description: expect.any(String),
        visibility: expect.any(String),
        shareWithGroupLock: expect.any(Boolean),
        requireTwoFactorAuthentication: expect.any(Boolean),
        twoFactorGracePeriod: expect.any(Number),
        projectCreationLevel: expect.any(String),
        subgroupCreationLevel: expect.any(String),
        lfsEnabled: expect.any(Boolean),
        defaultBranchProtection: expect.any(Number),
        webUrl: expect.any(String),
        requestAccessEnabled: expect.any(Boolean),
        fullName: expect.any(String),
        fullPath: expect.any(String),
      }),
    ]),
  );
});
