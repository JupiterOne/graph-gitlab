import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/config';
import { setupRecording, Recording } from '../../../../test/recording';
import { Steps } from '../../../constants';

let recording: Recording | undefined;

afterEach(async () => await recording?.stop());

test(Steps.PROJECT_LABELS, async () => {
  recording = setupRecording({
    directory: __dirname,
    name: Steps.PROJECT_LABELS,
  });

  const stepTestConfig = getStepTestConfigForStep(Steps.PROJECT_LABELS);
  const stepResult = await executeStepWithDependencies(stepTestConfig);
  expect(stepResult).toMatchStepMetadata(stepTestConfig);
});
