import { GitLabMergeRequest } from '../provider/types';

/**
 * Example input: https://gitlab.com/jupiterone-dev/test-proj/-/merge_requests/1
 * Example output: https://gitlab.com/jupiterone-dev/test-proj
 */
export function getBaseRepositoryUrlFromWebUrl(
  webUrl: string,
): string | undefined {
  // ['https://gitlab.com/jupiterone-dev/test-proj', 'merge_requests/1']
  const expectedSplitPartsSize = 2;
  const parts = webUrl.split('/-/');
  if (parts.length !== expectedSplitPartsSize) return undefined;
  return parts[0];
}

export function buildCommitWebLinkFromCommitSha(
  baseUrl: string,
  commitSha: string,
) {
  return `${baseUrl}/-/commit/${commitSha}`;
}

export function getCommitWebLinkFromMergeRequest(
  mergeRequest: GitLabMergeRequest,
): string | undefined {
  const sha = mergeRequest.merge_commit_sha || mergeRequest.squash_commit_sha;
  if (!sha) return;

  const baseUrl = getBaseRepositoryUrlFromWebUrl(mergeRequest.web_url);
  return baseUrl && buildCommitWebLinkFromCommitSha(baseUrl, sha);
}
