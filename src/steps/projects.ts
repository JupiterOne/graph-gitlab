import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  parseTimePropertyValue,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../constants';
import { createProjectEntity } from '../converters';
import { createGitlabClient } from '../provider';
import { GitLabGroup, GitLabGroupRef, GitLabProject } from '../provider/types';
import { GitlabIntegrationConfig } from '../types';
import { getAccessLevel } from '../util/getAccessLevel';
import { createGroupEntityIdentifier } from './fetch-groups';

export async function fetchProjects({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<GitlabIntegrationConfig>) {
  const client = createGitlabClient(instance.config, logger);

  const projectKeys = new Set<string>();
  const addProjectEntity = async (project: GitLabProject): Promise<Entity> => {
    const projectEntity = createProjectEntity(project);
    if (!projectKeys.has(projectEntity._key)) {
      await jobState.addEntity(projectEntity);
      projectKeys.add(projectEntity._key);
    }
    return projectEntity;
  };

  // Maps groupId to projectIds
  const processedPairs: Map<number, number[]> = new Map();

  // To get to all the projects we need to take the groups we have ingested
  // and iterate through projects belonging to them
  await jobState.iterateEntities(
    { _type: Entities.GROUP._type },
    async (groupEntity) => {
      const group = getRawData(groupEntity) as GitLabGroup;

      await client.iterateGroupProjects(group.id, async (project) => {
        // Project can be shared with many groups
        // (potentially including the one we used above to find the project)
        const sharedWithGroups: GitLabGroupRef[] = project.shared_with_groups;
        const projectEntity = await addProjectEntity(project);

        const groupProjects = processedPairs.get(group.id);
        if (groupProjects?.includes(project.id)) {
          // Already processed
          return;
        }

        processedPairs.set(group.id, [...(groupProjects || []), project.id]);

        // We want to link this project with all of its groups (group -HAS-> project)
        // However depending on criteria below, we may or may not have additional info found within project.shared_with_groups section.

        // If the group used for finding this project exists in the project.shared_with_groups section, we have additional data
        const originGroupIndex = sharedWithGroups.findIndex(
          (sharedGroup) => sharedGroup.group_id === group.id,
        );
        if (originGroupIndex !== -1) {
          const sharedGroup = sharedWithGroups[originGroupIndex];
          const groupAccessLevel = getAccessLevel(
            sharedGroup.group_access_level,
          );

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: groupEntity,
              to: projectEntity,
              properties: {
                groupId: sharedGroup.group_id,
                groupAccessLevel,
                groupName: sharedGroup.group_name,
                groupFullPath: sharedGroup.group_full_path,
                expiresOn: parseTimePropertyValue(sharedGroup.expires_at),
              },
            }),
          );
          // Remove it from array as it's already processed
          sharedWithGroups.splice(originGroupIndex, 1);
        } else {
          // If the group wasn't found within project.shared_with_groups we still want to add it since we found this project based off of this group but this time without properties
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: groupEntity,
              to: projectEntity,
            }),
          );
        }

        // Now we can safely iterate through remainder of the shared groups and make connections
        // Safely means here that we are not expecting to stumble upon the 'origin group' here
        // The group we've used to find all of the projects belong to it
        // Which means we'll have access to all the properties contained within project.shared_with_groups
        // and can just loop through and process all of the groups with the same code.
        for (const sharedGroup of sharedWithGroups) {
          const sharedGroupProjects = processedPairs.get(sharedGroup.group_id);
          if (sharedGroupProjects?.includes(project.id)) {
            // Already processed
            return;
          }

          const targetGroup = await jobState.findEntity(
            createGroupEntityIdentifier(sharedGroup.group_id),
          );
          const groupAccessLevel = getAccessLevel(
            sharedGroup.group_access_level,
          );

          if (targetGroup) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: targetGroup,
                to: projectEntity,
                properties: {
                  groupId: sharedGroup.group_id,
                  groupAccessLevel,
                  groupName: sharedGroup.group_name,
                  groupFullPath: sharedGroup.group_full_path,
                  expiresOn: parseTimePropertyValue(sharedGroup.expires_at),
                },
              }),
            );

            processedPairs.set(sharedGroup.group_id, [
              ...(sharedGroupProjects || []),
              project.id,
            ]);
          }
        }
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
