import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../test/config';
import { setupRecording, Recording } from '../../test/recording';
import { Steps } from '../constants';

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
