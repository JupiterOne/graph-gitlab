import {
  mutations,
  Recording,
  setupRecording as sdkSetupRecording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../src';

export { Recording } from '@jupiterone/integration-sdk-testing';
type SetupParameters = Parameters<typeof sdkSetupRecording>[0];

const configFromEnv = {
  baseUrl: process.env.BASE_URL || 'https://gitlab.com',
  personalToken: process.env.PERSONAL_TOKEN || 'string-value',
};

/**
 * This function is a wrapper around the SDK's setup recording function
 * that redacts the 'private-token' header.
 */
export function setupRecording({
  name,
  directory,
  ...overrides
}: SetupParameters): Recording {
  return sdkSetupRecording({
    directory,
    name,
    redactedRequestHeaders: ['private-token'],
    mutateEntry: mutations.unzipGzippedRecordingEntry,
    ...overrides,
  });
}

export function getStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: configFromEnv,
    invocationConfig: {
      ...invocationConfig,
    } as any,
  };
}
