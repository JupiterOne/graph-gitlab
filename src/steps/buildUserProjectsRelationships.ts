import {
  Entity,
  JobState,
  Relationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../provider';
import { STEP_ID as PROJECT_STEP, PROJECT_TYPE } from './fetchProjects';
import {
  STEP_ID as USER_STEP,
  USER_TYPE,
  createUserEntityIdentifier,
} from './fetchUsers';

const step: IntegrationStep = {
  id: 'build-user-project-relationships',
  name: 'Build user project relationships',
  types: ['gitlab_user_manages_project'],
  dependsOn: [PROJECT_STEP, USER_STEP],
  async executionHandler({
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const userIdMap = await createUserIdMap(jobState);

    await jobState.iterateEntities({ _type: PROJECT_TYPE }, async (project) => {
      const [, id] = project.id.toString().split(':');

      const projectMembers = await client.fetchProjectMembers(parseInt(id, 10));

      if (projectMembers.length > 0) {
        await jobState.addRelationships(
          projectMembers.map((member) =>
            createProjectUserRelationship(
              userIdMap.get(createUserEntityIdentifier(member.id)),
              project,
            ),
          ),
        );
      }
    });
  },
};

async function createUserIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const userIdMap = new Map<string, Entity>();

  await jobState.iterateEntities({ _type: USER_TYPE }, (user) => {
    userIdMap.set(user.id as string, user);
  });

  return userIdMap;
}

export default step;

export function createProjectUserRelationship(
  member: Entity,
  project: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'MANAGES',
    from: member,
    to: project,
  });
}
