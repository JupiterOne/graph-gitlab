import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';

import { createGitlabClient } from '../../provider';
import { GitLabGroup } from '../../provider/types';

export const STEP_ID = 'fetch-groups';
export const GROUP_TYPE = 'gitlab_group';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch groups',
  types: [GROUP_TYPE],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createGitlabClient(instance);
    const groups = await client.fetchGroups();
    await jobState.addEntities(groups.map(createGroupEntity));
  },
};

export function createGroupEntity(group: GitLabGroup): Entity {
  const key = createGroupEntityIdentifier(group.id);

  return createIntegrationEntity({
    entityData: {
      source: group,
      assign: {
        _key: key,
        _type: GROUP_TYPE,
        _class: 'Group',

        id: group.id.toString(),
        parentGroupId: group.parent_id && group.parent_id.toString(),
        name: group.name,
        createdOn: new Date(group.created_at).getTime(),
        path: group.path,
        description: group.description,
        visibility: group.visibility,
        shareWithGroupLock: group.share_with_group_lock,
        requireTwoFactorAuthentication: group.require_two_factor_authentication,
        twoFactorGracePeriod: group.two_factor_grace_period,
        projectCreationLevel: group.project_creation_level,
        autoDevopsEnabled: group.auto_devops_enabled,
        subgroupCreationLevel: group.subgroup_creation_level,
        emailsDisabled: group.emails_disabled,
        mentionsDisabled: group.mentions_disabled,
        lfsEnabled: group.lfs_enabled,
        defaultBranchProtection: group.default_branch_protection,
        webUrl: group.web_url,
        requestAccessEnabled: group.request_access_enabled,
        fullName: group.full_name,
        fullPath: group.full_path,
        fileTemplateProjectId: group.file_template_project_id,
      },
    },
  });
}

const GROUP_ID_PREFIX = 'gitlab-group';
export function createGroupEntityIdentifier(id?: number): string {
  return id ? `${GROUP_ID_PREFIX}:${id}` : undefined;
}

export default step;
