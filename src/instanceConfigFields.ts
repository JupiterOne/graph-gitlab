import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { GitlabIntegrationConfig } from './types';

const instanceConfigFields: IntegrationInstanceConfigFieldMap<GitlabIntegrationConfig> =
  {
    personalToken: {
      type: 'string',
      mask: true,
    },
    baseUrl: {
      type: 'string',
    },
    mergeRequestsUpdatedAfter: {
      type: 'string',
    },
  };

export default instanceConfigFields;
