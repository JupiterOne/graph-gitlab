import {
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import {
  createMockExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import { GitlabIntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import { resetClient } from './provider';

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
    resetClient();
  });

  test('authentication error', async () => {
    recording = setupRecording({
      directory: 'src/__recordings__',
      name: 'validateInvocationAuthenticationError',
      options: { recordFailedRequests: true },
    });

    const executionContext =
      createMockExecutionContext<GitlabIntegrationConfig>({
        instanceConfig: {
          baseUrl: 'https://example.com',
          personalToken: 'INVALID',
        },
      });

    await expect(validateInvocation(executionContext)).rejects.toThrowError(
      IntegrationProviderAuthenticationError,
    );
  });

  test('base url error', async () => {
    recording = setupRecording({
      directory: 'src/__recordings__',
      name: 'validateInvocationBaseUrlIsInvalid',
      options: { recordFailedRequests: true },
    });

    const context = createMockExecutionContext<GitlabIntegrationConfig>({
      instanceConfig: {
        baseUrl: 'https://gitlab.jupiterone.io',
        personalToken: 'INVALID',
      },
    });
    await expect(validateInvocation(context)).rejects.toThrowError(
      IntegrationValidationError,
    );
  });
});
