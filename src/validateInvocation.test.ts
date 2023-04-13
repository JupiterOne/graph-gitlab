import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import {
  createMockExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import { GitlabIntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

test('requires valid config', async () => {
  const executionContext = createMockExecutionContext<GitlabIntegrationConfig>({
    instanceConfig: {} as GitlabIntegrationConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrowError(
    IntegrationValidationError,
  );
});

describe('api response', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('authentication error', async () => {
    recording = setupRecording({
      directory: '__recordings__',
      name: 'validateInvocationAuthenticationError',
    });

    recording.server.any().intercept((req, res) => {
      res.status(401);
    });

    const executionContext = createMockExecutionContext<GitlabIntegrationConfig>(
      {
        instanceConfig: {
          baseUrl: 'https://example.com',
          personalToken: 'INVALID',
        },
      },
    );

    await expect(validateInvocation(executionContext)).rejects.toThrowError(
      IntegrationValidationError,
    );
  });

  test('authorization error', async () => {
    recording = setupRecording({
      directory: '__recordings__',
      name: 'validateInvocationAuthorizationError',
    });

    recording.server.any().intercept((req, res) => {
      res.status(403);
    });

    const executionContext = createMockExecutionContext<GitlabIntegrationConfig>(
      {
        instanceConfig: {
          baseUrl: 'https://example.com',
          personalToken: 'INVALID',
        },
      },
    );

    await expect(validateInvocation(executionContext)).rejects.toThrowError(
      IntegrationValidationError,
    );
  });

  test('base url error', async () => {
    recording = setupRecording({
      directory: 'src/__recordings__',
      name: 'validateInvocationBaseUrlIsInvalid',
      options: { recordFailedRequests: true },
    });

    const executionContext = createMockExecutionContext<GitlabIntegrationConfig>(
      {
        instanceConfig: {
          baseUrl: 'https://example123.com',
          personalToken: 'INVALID',
        },
      },
    );
    await expect(validateInvocation(executionContext)).rejects.toThrowError(
      IntegrationValidationError,
    );
  });
});
