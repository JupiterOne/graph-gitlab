import { Entity } from '@jupiterone/integration-sdk-core';

import {
  prClass,
  projectClass,
  projectSchema,
  prSchema,
} from '../../test/schemas';
import {
  GitLabMergeRequest,
  GitLabMergeRequestApproval,
  GitLabProject,
} from '../provider/types';
import {
  createMergeRequestEntity,
  createProjectEntity,
  createUserEntity,
} from './index';

describe('createProjectEntity', () => {
  const sampleProjects = require('../../test/fixtures/projects.json');

  function convertProject(project: GitLabProject): Entity {
    const entity = createProjectEntity(project);
    expect(entity).toMatchGraphObjectSchema({
      _class: projectClass,
      schema: projectSchema,
    });
    return entity;
  }

  test('no owner', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        owner: undefined,
      }),
    ).toEqual(
      expect.objectContaining({
        owner: undefined,
      }),
    );
  });

  test('owner', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        owner: {
          id: 1234,
          name: 'owner',
        },
      }),
    ).toEqual(
      expect.objectContaining({
        owner: 'owner',
      }),
    );
  });

  test('null allow_merge_on_skipped_pipeline', () => {
    expect(
      convertProject({
        ...sampleProjects[0],
        allow_merge_on_skipped_pipeline: null,
      }),
    ).toEqual(
      expect.objectContaining({
        allowMergeOnSkippedPipeline: false,
      }),
    );
  });
});

describe('createUserEntity', () => {
  test('User entity conversion', () => {
    const user = {
      id: 1,
      name: 'Administrator',
      username: 'root',
      created_at: '2020-01-01T00:00:00.000Z',
      web_url: 'https://url',
      state: 'state-value',
      email: 'some@email.com',
      public_email: 'public@email.com',
      is_admin: true,
      can_create_group: true,
      can_create_project: true,
      two_factor_enabled: false,
      external: false,
      private_profile: false,
      trial: false,
    };

    const entity = createUserEntity(user);

    expect(entity).toEqual(
      expect.objectContaining({
        _key: 'gitlab-user:1',
        _type: 'gitlab_user',
        _class: ['User'],
        _rawData: expect.any(Array),
        id: '1',
        createdOn: expect.any(Number),
        displayName: 'Administrator',
        email: 'some@email.com',
        canCreateGroup: true,
        canCreateProject: true,
        external: false,
        isAdmin: true,
        name: expect.any(String),
        privateProfile: false,
        publicEmail: 'public@email.com',
        state: 'state-value',
        trial: false,
        twoFactorEnabled: false,
        username: 'root',
        webLink: 'https://url',
      }),
    );
  });
});

describe('createMergeRequestEntity', () => {
  const sampleData = require('../../test/fixtures/mergeRequests.json');

  function convertMergeRequest(
    mergeRequest: GitLabMergeRequest,
    approval: GitLabMergeRequestApproval,
  ): Entity {
    const entity = createMergeRequestEntity(
      'projectName',
      mergeRequest,
      approval,
    );
    expect(entity).toMatchGraphObjectSchema({
      _class: prClass,
      schema: prSchema,
    });
    return entity;
  }

  test('schema', () => {
    for (const data of sampleData) {
      expect(
        convertMergeRequest(data.mergeRequest, data.approval),
      ).toMatchGraphObjectSchema({
        _class: prClass,
        schema: prSchema,
      });
    }
  });
});
