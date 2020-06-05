import {
  Recording,
  setupRecording as sdkSetupRecording,
} from '@jupiterone/integration-sdk-testing';
export { Recording } from '@jupiterone/integration-sdk-testing';

type SetupParameters = Parameters<typeof sdkSetupRecording>[0];

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
    ...overrides,
  });
}
