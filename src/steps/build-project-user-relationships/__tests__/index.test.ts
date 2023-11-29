import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  getStepTestConfigForStep,
  setupRecording,
} from '../../../../test';
import { Steps } from '../../../constants';

let recording: Recording | undefined;

afterEach(async () => await recording?.stop());

test(Steps.BUILD_PROJECT_HAS_USER, async () => {
  recording = setupRecording({
    directory: __dirname,
    name: Steps.BUILD_PROJECT_HAS_USER,
  });

  const stepTestConfig = getStepTestConfigForStep(Steps.BUILD_PROJECT_HAS_USER);
  const stepResult = await executeStepWithDependencies(stepTestConfig);
  expect(stepResult).toMatchStepMetadata(stepTestConfig);
});
