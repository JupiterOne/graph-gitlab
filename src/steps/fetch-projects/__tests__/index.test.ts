import step, { createProjectEntity } from '../';
import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '../../../../test';
import { createGitlabClient } from '../../../provider';
import { GitLabProject } from '../../../provider/types';
import fetchGroups from '../../fetch-groups';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'projects',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('Project fetching', async () => {
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
    },
  });
  const provider = createGitlabClient(context.instance);

  const groups = await provider.fetchGroups();
  const results: GitLabProject[] = [];

  await provider.iterateGroupProjects(groups[0].id, (project) => {
    results.push(project);
  });

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        created_at: expect.any(String),
        description: expect.any(String),
        web_url: expect.any(String),
      }),
    ]),
  );
});

test('Project entity conversion', async () => {
  const projectNoOwner = {
    id: 1,
    name: 'project',
    created_at: '2020-01-01T00:00:00.000Z',
    description: 'desc',
    web_url: 'https://url',
    visibility: 'private',
    issues_enabled: true,
    merge_requests_enabled: true,
    jobs_enabled: true,
    wiki_enabled: true,
    snippets_enabled: true,
    can_create_merge_request_in: true,
    resolve_outdated_diff_discussions: true,
    container_registry_enabled: true,
    archived: false,
    shared_runners_enabled: true,
    public_jobs: true,
    only_allow_merge_if_pipeline_succeeds: false,
    only_allow_merge_if_all_discussions_are_resolved: true,
    remove_source_branch_after_merge: true,
    request_access_enabled: true,
    autoclose_referenced_issues: true,
  } as GitLabProject;

  const entityNoOwner = createProjectEntity(projectNoOwner);

  expect(entityNoOwner).toEqual(
    expect.objectContaining({
      _key: 'gitlab-project:1',
      _type: 'gitlab_project',
      _class: ['Project', 'CodeRepo'],
      _rawData: expect.any(Array),
      id: '1',
      name: 'project',
      owner: undefined,
      createdOn: expect.any(Number),
      description: 'desc',
      webLink: 'https://url',
      visibility: 'private',
      public: false,
      issuesEnabled: true,
      mergeRequestsEnabled: true,
      jobsEnabled: true,
      wikiEnabled: true,
      snippetsEnabled: true,
      canCreateMergeRequestIn: true,
      resolveOutdatedDiffDiscussions: true,
      containerRegistryEnabled: true,
      archived: false,
      sharedRunnersEnabled: true,
      publicJobs: true,
      onlyAllowMergeIfPipelineSucceeds: false,
      onlyAllowMergeIfAllDiscussionsAreResolved: true,
      removeSourceBranchAfterMerge: true,
      requestAccessEnabled: true,
      autocloseReferencedIssues: true,
    }),
  );

  const projectWithOwner = {
    id: 2,
    name: 'project',
    owner: {
      name: 'owner',
    },
    created_at: '2020-01-01T00:00:00.000Z',
    description: 'desc',
    web_url: 'https://url',
    visibility: 'private',
    issues_enabled: true,
    merge_requests_enabled: true,
    jobs_enabled: true,
    wiki_enabled: true,
    snippets_enabled: true,
    can_create_merge_request_in: true,
    resolve_outdated_diff_discussions: true,
    container_registry_enabled: true,
    archived: false,
    shared_runners_enabled: true,
    public_jobs: true,
    only_allow_merge_if_pipeline_succeeds: false,
    only_allow_merge_if_all_discussions_are_resolved: true,
    remove_source_branch_after_merge: true,
    request_access_enabled: true,
    autoclose_referenced_issues: true,
  } as GitLabProject;

  const entityWithOwner = createProjectEntity(projectWithOwner);

  expect(entityWithOwner).toEqual(
    expect.objectContaining({
      _key: 'gitlab-project:2',
      _type: 'gitlab_project',
      _class: ['Project', 'CodeRepo'],
      _rawData: expect.any(Array),
      id: '2',
      name: 'project',
      owner: 'owner',
      createdOn: expect.any(Number),
      description: 'desc',
      webLink: 'https://url',
      visibility: 'private',
      public: false,
      issuesEnabled: true,
      mergeRequestsEnabled: true,
      jobsEnabled: true,
      wikiEnabled: true,
      snippetsEnabled: true,
      canCreateMergeRequestIn: true,
      resolveOutdatedDiffDiscussions: true,
      containerRegistryEnabled: true,
      archived: false,
      sharedRunnersEnabled: true,
      publicJobs: true,
      onlyAllowMergeIfPipelineSucceeds: false,
      onlyAllowMergeIfAllDiscussionsAreResolved: true,
      removeSourceBranchAfterMerge: true,
      requestAccessEnabled: true,
      autocloseReferencedIssues: true,
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
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedRelationships.length).toBeGreaterThan(0);

  expect(
    context.jobState.collectedEntities.filter((e) =>
      e._class.includes('CodeRepo'),
    ),
  ).toMatchGraphObjectSchema({
    _class: ['Project', 'CodeRepo'],
    schema: {
      additionalProperties: false,
      properties: {
        _class: { const: ['Project', 'CodeRepo'] },
        _type: { const: 'gitlab_project' },
        _rawData: { type: 'array', items: { type: 'object' } },
        name: { type: 'string' },
        createdOn: { type: 'number' },
        description: { type: 'string' },
        webLink: { type: 'string' },
        visibility: { type: 'string' },
        public: { type: 'boolean' },
        issuesEnabled: { type: 'boolean' },
        mergeRequestsEnabled: { type: 'boolean' },
        jobsEnabled: { type: 'boolean' },
        wikiEnabled: { type: 'boolean' },
        snippetsEnabled: { type: 'boolean' },
        canCreateMergeRequestIn: { type: 'boolean' },
        resolveOutdatedDiffDiscussions: { type: ['boolean', 'null'] },
        containerRegistryEnabled: { type: 'boolean' },
        archived: { type: 'boolean' },
        sharedRunnersEnabled: { type: 'boolean' },
        publicJobs: { type: 'boolean' },
        onlyAllowMergeIfPipelineSucceeds: { type: 'boolean' },
        onlyAllowMergeIfAllDiscussionsAreResolved: { type: 'boolean' },
        removeSourceBranchAfterMerge: { type: 'boolean' },
        requestAccessEnabled: { type: 'boolean' },
        autocloseReferencedIssues: { type: 'boolean' },
      },
    },
  });
});
