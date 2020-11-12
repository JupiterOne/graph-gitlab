import fs from 'fs';
import path from 'path';

import { GraphObjectSchema } from '@jupiterone/integration-sdk-testing';

import step, { createProjectEntity } from '../';
import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '../../../../test';
import { createGitlabClient } from '../../../provider';
import { GitLabProject } from '../../../provider/types';
import fetchGroups from '../../fetch-groups';
import { Entity } from '@jupiterone/integration-sdk-core';

const projectClass = ['Project', 'CodeRepo'];
const projectSchema: GraphObjectSchema = {
  additionalProperties: false,
  properties: {
    _class: { const: projectClass },
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
    allowMergeOnSkippedPipeline: { type: 'boolean' },
    onlyAllowMergeIfPipelineSucceeds: { type: 'boolean' },
    onlyAllowMergeIfAllDiscussionsAreResolved: { type: 'boolean' },
    removeSourceBranchAfterMerge: { type: 'boolean' },
    requestAccessEnabled: { type: 'boolean' },
    autocloseReferencedIssues: { type: 'boolean' },
  },
};

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

describe('createProjectEntity', () => {
  const sampleProjects = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, '..', '__fixtures__', 'projects.json'))
      .toString(),
  ) as GitLabProject[];

  function convertProject(project: GitLabProject): Entity {
    const entity = createProjectEntity(project);
    expect(entity).toMatchGraphObjectSchema({
      _class: projectClass,
      schema: projectSchema,
    });
    return entity;
  }

  test('no owner', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        owner: undefined,
      }),
    ).toEqual(
      expect.objectContaining({
        owner: undefined,
      }),
    );
  });

  test('owner', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        owner: {
          id: 1234,
          name: 'owner',
        },
      }),
    ).toEqual(
      expect.objectContaining({
        owner: 'owner',
      }),
    );
  });

  test('null allow_merge_on_skipped_pipeline', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        allow_merge_on_skipped_pipeline: null,
      }),
    ).toEqual(
      expect.objectContaining({
        allowMergeOnSkippedPipeline: false,
      }),
    );
  });
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
    _class: projectClass,
    schema: projectSchema,
  });
});
