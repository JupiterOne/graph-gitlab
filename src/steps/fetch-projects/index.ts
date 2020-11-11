import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { Entities, Relationships, Steps } from '../../constants';
import { createGitlabClient } from '../../provider';
import { GitLabGroup, GitLabProject } from '../../provider/types';
import { GitlabIntegrationConfig } from '../../types';

const step: IntegrationStep<GitlabIntegrationConfig> = {
  id: Steps.PROJECTS,
  name: 'Fetch projects',
  entities: [Entities.PROJECT],
  relationships: [Relationships.GROUP_HAS_PROJECT],
  dependsOn: [Steps.GROUPS],
  async executionHandler({ instance, jobState }) {
    const client = createGitlabClient(instance);

    const projectKeys = new Set<string>();
    const addProjectEntity = async (project: GitLabProject) => {
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
  },
};

export function createProjectEntity(project: GitLabProject): Entity {
  const { _links, ...source } = project; // drop the _links
  const key = createProjectEntityIdentifier(project.id);

  return createIntegrationEntity({
    entityData: {
      source,
      assign: {
        _key: key,
        _type: Entities.PROJECT._type,
        _class: Entities.PROJECT._class,

        id: project.id.toString(),
        name: project.name,
        owner: project.owner?.name,
        createdOn: new Date(project.created_at).getTime(),
        description: project.description,
        webLink: project.web_url,
        visibility: project.visibility,
        public: project.visibility !== 'private',
        issuesEnabled: project.issues_enabled,
        mergeRequestsEnabled: project.merge_requests_enabled,
        jobsEnabled: project.jobs_enabled,
        wikiEnabled: project.wiki_enabled,
        snippetsEnabled: project.snippets_enabled,
        canCreateMergeRequestIn: project.can_create_merge_request_in,
        resolveOutdatedDiffDiscussions:
          project.resolve_outdated_diff_discussions,
        containerRegistryEnabled: project.container_registry_enabled,
        archived: project.archived,
        sharedRunnersEnabled: project.shared_runners_enabled,
        publicJobs: project.public_jobs,
        onlyAllowMergeIfPipelineSucceeds:
          project.only_allow_merge_if_pipeline_succeeds,
        onlyAllowMergeIfAllDiscussionsAreResolved:
          project.only_allow_merge_if_all_discussions_are_resolved,
        removeSourceBranchAfterMerge: project.remove_source_branch_after_merge,
        requestAccessEnabled: project.request_access_enabled,
        autocloseReferencedIssues: project.autoclose_referenced_issues,
      },
    },
  });
}

const PROJECT_ID_PREFIX = 'gitlab-project';
export function createProjectEntityIdentifier(id: number): string {
  return `${PROJECT_ID_PREFIX}:${id}`;
}

export default step;
