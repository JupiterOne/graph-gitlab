import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import {
  createMockIntegrationLogger,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep, instanceConfig } from '../../test/config';
import { setupRecording, Recording } from '../../test/recording';
import { Steps } from '../constants';
import { GitlabClient } from '../provider/GitlabClient';

let recording: Recording | undefined;

afterEach(async () => await recording?.stop());

test('fetch-users', async () => {
  recording = setupRecording({
    directory: __dirname,
    name: 'fetch-users',
  });

  const stepTestConfig = getStepTestConfigForStep(Steps.USERS);

  const stepResult = await executeStepWithDependencies(stepTestConfig);

  expect(stepResult).toMatchStepMetadata(stepTestConfig);
});

/**
 * (ndowmon 2023-03-12)
 * GitLab API calls return with the following standard ratelimit headers, which
 * we at JupiterOne honor before every API call:
 *   - `ratelimit-limit`
 *   - `ratelimit-remaining`
 *   - `ratelimit-reset`
 *
 * However, we have learned through public GitLab documentation that the
 * **Users** API uses a different set of rate limits - by default, these allow
 * 300 API calls per 10 minutes, resetting every 10 minutes.
 *
 * See https://docs.gitlab.com/ee/user/admin_area/settings/rate_limit_on_users_api.html
 *
 * The `/users/<user-id>` API, therefore, does not honor the `ratelimit-*`
 * headers described above, and we cannot rely on those headers for rate
 * limiting. In the event that we receive a 429 response at the
 * `/users/<user-id>` endpoint, the best we can do to proceed is to wait 10
 * minutes and see if the rate limit has reset.
 *
 * ---
 * This test suite attempts to record the `429` response, but without recording
 * the preceding 300 `/users/<user-id>` responses which are necessary to force
 * a `429`.
 *
 * When testing/recording, developers should configure as:
 * ```
 *   test('record', async () => { ... })`
 *
 *   test.skip('replay', async () => { ... })`
 * ```
 *
 * and when replaying, or running in CI, developers should configure as:
 * ```
 *   test.skip('record', async () => { ... })`
 *
 *   test('replay', async () => { ... })`
 * ```
 */
describe('fetch-users 429 should wait 10 minutes', () => {
  async function forceFetchUsersRateLimit() {
    const client = new GitlabClient(
      instanceConfig.baseUrl,
      instanceConfig.personalToken,
      createMockIntegrationLogger(),
    );
    const user = await client.fetchAccount();

    let e: Error | undefined;
    try {
      let attemptNum = 1;
      /**
       * We expect to be throttled at the 301st API call.
       *
       * In order to prevent this test from running indefinitely, limit this
       * `while` loop to just 301 requests
       */
      while (attemptNum <= 301) {
        // eslint-disable-next-line no-console
        console.log({ attemptNum });
        await client.fetchUser(user.id);
        attemptNum += 1;
      }
    } catch (err) {
      e = err;
    }

    expect(e).not.toBeUndefined();
    expect((e as IntegrationProviderAPIError).status).toBe(429);
  }

  test.skip(
    'record',
    async () => {
      /**
       * Make enough `/users/<user-id>` API calls to force a 429 response.
       *
       * Only start recording _after_ this API gets throttled.
       */
      await forceFetchUsersRateLimit();

      recording = setupRecording({
        directory: __dirname,
        name: 'fetch-users-429',
        options: { recordFailedRequests: true },
      });

      const stepTestConfig = getStepTestConfigForStep(Steps.USERS);

      const stepResult = await executeStepWithDependencies(stepTestConfig);
      expect(stepResult).toMatchStepMetadata(stepTestConfig);
    },
    15 * 60_000,
  ); // Allow this test to run for 15 minutes - 10 minutes of waiting time, plus buffer on either end.

  test('replay', async () => {
    const flushPromises = () => new Promise((res) => setImmediate(res));

    jest.useFakeTimers('legacy');
    recording = setupRecording({
      directory: __dirname,
      name: 'fetch-users-429',
      options: { recordFailedRequests: true },
    });

    const stepTestConfig = getStepTestConfigForStep(Steps.USERS);

    let stepResult:
      | Awaited<ReturnType<typeof executeStepWithDependencies>>
      | undefined;
    let err: Error | undefined;
    executeStepWithDependencies(stepTestConfig)
      .then((r) => (stepResult = r))
      .catch((e) => (err = e));

    while (!stepResult && !err) {
      await flushPromises();
      jest.advanceTimersByTime(1_000);
    }
    expect(err).toBeUndefined();
    expect(stepResult).toMatchStepMetadata(stepTestConfig);
    jest.useRealTimers();
  });
});
