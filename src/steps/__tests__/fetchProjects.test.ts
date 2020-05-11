import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../test';

import { GitLabProject } from '../../provider/types';
import { createGitlabClient } from '../../provider';
import step, { createProjectEntity } from '../fetchProjects';

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

  const results = await provider.fetchProjects();

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
      id: 'gitlab-project:1',
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
      id: 'gitlab-project:2',
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
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: expect.stringMatching(/gitlab-project:[0-9]+/),
        _type: 'gitlab_project',
        _class: ['Project', 'CodeRepo'],
        _rawData: expect.any(Array),
        id: expect.any(String),
        name: expect.any(String),
        createdOn: expect.any(Number),
        description: expect.any(String),
        webLink: expect.any(String),
        visibility: expect.any(String),
        public: expect.any(Boolean),
        issuesEnabled: expect.any(Boolean),
        mergeRequestsEnabled: expect.any(Boolean),
        jobsEnabled: expect.any(Boolean),
        wikiEnabled: expect.any(Boolean),
        snippetsEnabled: expect.any(Boolean),
        canCreateMergeRequestIn: expect.any(Boolean),
        resolveOutdatedDiffDiscussions: expect.any(Boolean),
        containerRegistryEnabled: expect.any(Boolean),
        archived: expect.any(Boolean),
        sharedRunnersEnabled: expect.any(Boolean),
        publicJobs: expect.any(Boolean),
        onlyAllowMergeIfPipelineSucceeds: expect.any(Boolean),
        onlyAllowMergeIfAllDiscussionsAreResolved: expect.any(Boolean),
        removeSourceBranchAfterMerge: expect.any(Boolean),
        requestAccessEnabled: expect.any(Boolean),
        autocloseReferencedIssues: expect.any(Boolean),
      }),
    ]),
  );
});
