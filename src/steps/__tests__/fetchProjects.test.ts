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
  const context = createMockStepExecutionContext();
  const provider = createGitlabClient(context.instance);

  const results = await provider.fetchProjects();

  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: 'First project',
      }),
      expect.objectContaining({
        id: expect.any(Number),
        name: 'child project',
      }),
    ]),
  );
});

test('Project entity conversion', async () => {
  const projectNoOwner = {
    id: 1,
    name: 'project',
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabProject;

  const entityNoOwner = createProjectEntity(projectNoOwner);

  expect(entityNoOwner).toEqual(
    expect.objectContaining({
      _key: 'gitlab-project:1',
      _type: 'gitlab_project',
      _class: ['Project'],
      id: 'gitlab-project:1',
      name: 'project',
      owner: undefined,
      createdOn: expect.any(Number),
      _rawData: [
        {
          name: 'default',
          rawData: projectNoOwner,
        },
      ],
    }),
  );

  const projectWithOwner = {
    id: 2,
    name: 'project2',
    owner: {
      name: 'owner',
    },
    created_at: '2020-01-01T00:00:00.000Z',
  } as GitLabProject;

  const entityWithOwner = createProjectEntity(projectWithOwner);

  expect(entityWithOwner).toEqual(
    expect.objectContaining({
      _key: 'gitlab-project:2',
      _type: 'gitlab_project',
      _class: ['Project'],
      id: 'gitlab-project:2',
      name: 'project2',
      owner: 'owner',
      createdOn: expect.any(Number),
      _rawData: [
        {
          name: 'default',
          rawData: projectWithOwner,
        },
      ],
    }),
  );
});

test('step data collection', async () => {
  const context = createMockStepExecutionContext();
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _key: 'gitlab-project:1',
      }),
      expect.objectContaining({
        _key: 'gitlab-project:2',
      }),
    ]),
  );
});
