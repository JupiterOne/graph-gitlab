import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../constants';
import { createProjectEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabGroup, GitLabProject } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';

export async function fetchProjects({
  instance,
  jobState,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config);

  const projectKeys = new Set<string>();
  const addProjectEntity = async (project: GitLabProject): Promise<Entity> => {
    const projectEntity = createProjectEntity(project);
    if (!projectKeys.has(projectEntity._key)) {
      await jobState.addEntity(projectEntity);
      projectKeys.add(projectEntity._key);
    }
    return projectEntity;
  };

  // Projects in groups accessible to the user
  await jobState.iterateEntities(
    { _type: Entities.GROUP._type },
    async (groupEntity) => {
      const group = getRawData(groupEntity) as GitLabGroup;

      await client.iterateGroupProjects(group.id, async (project) => {
        const projectEntity = await addProjectEntity(project);
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: groupEntity,
            to: projectEntity,
          }),
        );
      });
    },
  );

  // Projects owned by the user
  await client.iterateOwnedProjects(async (project) => {
    await addProjectEntity(project);
  });
}

export const projectSteps: IntegrationStep<GitlabIntegrationConfig>[] = [
  {
    id: Steps.PROJECTS,
    name: 'Fetch projects',
    entities: [Entities.PROJECT],
    relationships: [Relationships.GROUP_HAS_PROJECT],
    dependsOn: [Steps.GROUPS],
    executionHandler: fetchProjects,
  },
];
