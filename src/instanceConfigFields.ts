import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  personalToken: {
    type: 'string',
    mask: true,
  },
  baseUrl: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
