import {
  buildCommitWebLinkFromCommitSha,
  getBaseRepositoryUrlFromWebUrl,
  getCommitWebLinkFromMergeRequest,
} from './mergeRequest';

describe('#getBaseRepositoryUrlFromWebUrl', () => {
  test('should return base repository URL if valid input supplied', () => {
    expect(
      getBaseRepositoryUrlFromWebUrl(
        'https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1',
      ),
    ).toEqual('https://gitlab.com/jupiterone-dev/test-proj');
  });

  test('should return undefined if invalid input supplied', () => {
    expect(getBaseRepositoryUrlFromWebUrl('')).toEqual(undefined);
  });
});

describe('#buildCommitWebLinkFromCommitSha', () => {
  test('should return base repository URL if valid input supplied', () => {
    expect(
      buildCommitWebLinkFromCommitSha(
        'https://gitlab.com/jupiterone-dev/test-proj',
        'abcdef',
      ),
    ).toEqual('https://gitlab.com/jupiterone-dev/test-proj/-/commit/abcdef');
  });
});

describe('#getCommitWebLinkFromMergeRequest', () => {
  test('should build commit web link from merge request when both merge commit sha and squash commit sha present', () => {
    expect(
      getCommitWebLinkFromMergeRequest({
        web_url:
          'https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1',
        merge_commit_sha: 'abc123',
        squash_commit_sha: 'abc456',
      } as any),
    ).toEqual('https://gitlab.com/jupiterone-dev/test-proj/-/commit/abc123');
  });

  test('should build commit web link from merge commit sha if no squash commit present', () => {
    expect(
      getCommitWebLinkFromMergeRequest({
        web_url:
          'https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1',
        merge_commit_sha: 'abc123',
      } as any),
    ).toEqual('https://gitlab.com/jupiterone-dev/test-proj/-/commit/abc123');
  });

  test('should build commit web link from squash commit sha if no merge commit sha present', () => {
    expect(
      getCommitWebLinkFromMergeRequest({
        web_url:
          'https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1',
        squash_commit_sha: 'abc456',
      } as any),
    ).toEqual('https://gitlab.com/jupiterone-dev/test-proj/-/commit/abc456');
  });

  test('should return undefined if neither merge commit or squash commit sha is present', () => {
    expect(
      getCommitWebLinkFromMergeRequest({
        web_url:
          'https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1',
      } as any),
    ).toEqual(undefined);
  });
});
