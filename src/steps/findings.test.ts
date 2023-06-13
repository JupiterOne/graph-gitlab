import {
  executeStepWithDependencies,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';

import { Steps } from '../constants';
import { getStepTestConfigForStep } from '../../test';

describe(Steps.FINDINGS, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(Steps.FINDINGS, async () => {
    recording = setupRecording({
      name: Steps.FINDINGS,
      directory: __dirname,
    });

    const stepTestConfig = getStepTestConfigForStep(Steps.FINDINGS);

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
