import { gunzipSync } from 'zlib';

import {
  Recording,
  RecordingEntry,
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
    mutateEntry: mutateRecordingEntry,
    ...overrides,
  });
}

function mutateRecordingEntry(entry: RecordingEntry): void {
  let responseText = entry.response.content.text;
  if (!responseText) {
    return;
  }

  const contentEncoding = entry.response.headers.find(
    (e) => e.name === 'content-encoding',
  );
  const transferEncoding = entry.response.headers.find(
    (e) => e.name === 'transfer-encoding',
  );

  if (contentEncoding && contentEncoding.value === 'gzip') {
    const chunkBuffers: Buffer[] = [];
    const hexChunks = JSON.parse(responseText) as string[];
    hexChunks.forEach((chunk) => {
      const chunkBuffer = Buffer.from(chunk, 'hex');
      chunkBuffers.push(chunkBuffer);
    });

    responseText = gunzipSync(Buffer.concat(chunkBuffers)).toString('utf-8');

    // Remove encoding/chunking since content is now unzipped
    entry.response.headers = entry.response.headers.filter(
      (e) => e && e !== contentEncoding && e !== transferEncoding,
    );
    // Remove recording binary marker
    delete (entry.response.content as any)._isBinary;
    entry.response.content.text = responseText;
  }
}
