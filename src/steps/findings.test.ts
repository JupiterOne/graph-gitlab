import {
  executeStepWithDependencies,
  Recording,
  setupRecording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';

import { Steps } from '../constants';
import { invocationConfig } from '..';

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

    const stepTestConfig: StepTestConfig = {
      stepId: Steps.FINDINGS,
      instanceConfig: {
        baseUrl: process.env.BASE_URL || 'https://gitlab.com',
        personalToken: process.env.PERSONAL_TOKEN || 'string-value',
      },
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
