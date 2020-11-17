import { Recording, setupRecording } from '../../test';
import { createGitlabClient } from './';
import { GitLabMergeRequest, GitLabProject } from './types';

const apiClient = createGitlabClient({
  baseUrl: process.env.BASE_URL || 'https://gitlab.com',
  personalToken: process.env.PERSONAL_TOKEN || 'string-value',
});

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateGroupProjects', () => {
  test('response', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateGroupProjects',
    });

    const groups = await apiClient.fetchGroups();
    const results: GitLabProject[] = [];

    await apiClient.iterateGroupProjects(groups[0].id, (project) => {
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
});

describe('iterateProjectMergeRequests', () => {
  test('response', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateProjectMergeRequests',
    });

    const projectId = 19688677;

    const results: GitLabMergeRequest[] = [];
    await apiClient.iterateProjectMergeRequests(
      projectId,
      (mergeRequest) => {
        results.push(mergeRequest);
      },
      {
        onPageError: jest.fn(),
        updatedAfter: new Date('2020-11-12'),
      },
    );

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          project_id: projectId,
        }),
      ]),
    );
  });
});

describe('fetchMergeRequestApprovals', () => {
  test('response', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'fetchMergeRequestApprovals',
    });

    const projectId = 19688677;
    const mergeRequestIid = 1;

    const results = await apiClient.fetchMergeRequestApprovals(
      projectId,
      mergeRequestIid,
    );

    expect(results).toEqual(
      expect.objectContaining({
        approved_by: expect.any(Array),
      }),
    );
  });
});
