import {
  createMockStepExecutionContext,
  GraphObjectSchema,
  MockJobState,
} from '@jupiterone/integration-sdk-testing';

import { Recording, setupRecording } from '../../test';
import {
  prClass,
  projectClass,
  projectSchema,
  prSchema,
  userClass,
  userSchema,
} from '../../test/schemas';
import { fetchMergeRequests } from './merge-requests';
import { fetchProjects } from './projects';
import { fetchUsers } from './users';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test('collect', async () => {
  recording = setupRecording({
    directory: __dirname,
    name: 'collect',
  });

  const context = createMockStepExecutionContext({
    instanceConfig: {
      baseUrl: process.env.BASE_URL || 'https://gitlab.com',
      personalToken: process.env.PERSONAL_TOKEN || 'string-value',
      mergeRequestsUpdatedAfter: new Date('2020-11-12'),
    },
  });

  await fetchProjects(context);
  await fetchUsers(context);
  await fetchMergeRequests(context);

  verifyCollectedEntities(context.jobState, projectClass, projectSchema);
  verifyCollectedEntities(context.jobState, userClass, userSchema);
  verifyCollectedEntities(context.jobState, prClass, prSchema);
});

function verifyCollectedEntities(
  jobState: MockJobState,
  _class: string[],
  schema: GraphObjectSchema,
): void {
  const entities = jobState.collectedEntities.filter((e) => {
    const entityClass = Array.isArray(e._class) ? e._class : Array(e._class);
    return entityClass.sort().every((e) => _class.includes(e));
  });
  expect(entities.length).toBeGreaterThan(0);
  expect(entities).toMatchGraphObjectSchema({
    _class,
    schema,
  });
}
