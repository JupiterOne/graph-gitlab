import {
  Recording,
  setupRecording,
  createMockStepExecutionContext,
} from '../../../../test';

import entities from './__fixtures__/entities.json';
import { GitLabMergeRequest } from '../../../provider/types';
import { createGitlabClient } from '../../../provider';
import step, { createMergeRequestEntity } from '..';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    directory: __dirname,
    name: 'merge_requests',
  });
});

afterEach(async () => {
  await recording.stop();
});

test('Merge request fetching', async () => {
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
      lastRun: new Date('2020-01-01T00:00:00Z'),
    },
    entities,
  });
  const provider = createGitlabClient(context.instance);
  const results = await provider.fetchProjectMergeRequests(18463260);

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        project_id: 18463260,
      }),
    ]),
  );
});

test('MergeRequest entity conversion', async () => {
  const mergeRequest = {
    id: 1,
    iid: 2,
    project_id: 18463260,
    title: 'PR',
    state: 'opened',
    source_branch: 'master',
    target_branch: 'feature/todo',
    description: 'Awesome PR',
    created_at: '2020-05-08T12:18:37.991Z',
    author: {
      id: 1,
    },
    web_url: 'https://',
    merge_when_pipeline_succeeds: false,
    should_remove_source_branch: false,
    force_remove_source_branch: false,
    allow_collaboration: false,
    allow_maintainer_to_push: false,
    squash: false,
  } as GitLabMergeRequest;

  const entity = createMergeRequestEntity(mergeRequest, 'project-1');

  expect(entity).toEqual(
    expect.objectContaining({
      _key: 'gitlab-merge-request:1',
      _type: 'gitlab_merge_request',
      _class: ['CodeReview', 'PR'],
      _rawData: expect.any(Array),
      id: '1',
      iid: 2,
      projectId: '18463260',
      name: 'PR',
      title: 'PR',
      state: 'opened',
      source: 'master',
      target: 'feature/todo',
      repository: 'project-1',
      createdOn: expect.any(Number),
      authorId: '1',
      webLink: 'https://',
      mergeWhenPipelineSucceeds: false,
      shouldRemoveSourceBranch: false,
      forceRemoveSourceBranch: false,
      allowCollaboration: false,
      allowMaintainerToPush: false,
      squash: false,
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
      lastRun: new Date('2020-01-01T00:00:00Z'),
    },
    entities,
  });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: expect.stringMatching(/gitlab-merge-request:[0-9]+/),
        _type: 'gitlab_merge_request',
        _class: ['CodeReview', 'PR'],
        _rawData: expect.any(Array),
        id: expect.stringMatching(/[0-9]+/),
        iid: expect.any(Number),
        projectId: expect.any(String),
        name: expect.any(String),
        title: expect.any(String),
        state: expect.any(String),
        source: expect.any(String),
        target: expect.any(String),
        repository: expect.any(String),
        createdOn: expect.any(Number),
        authorId: expect.any(String),
        webLink: expect.any(String),
      }),
    ]),
  );
});
