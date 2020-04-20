import {
  createIntegrationEntity,
  IntegrationStepExecutionContext,
} from '../../../../../framework';

export default {
  id: 'fetch-accounts',
  name: 'Fetch Accounts',
  types: ['my_account'],
  // executionHandler: () => {},
  executionHandler: async ({ jobState }: IntegrationStepExecutionContext) => {
    await jobState.addEntities([
      createIntegrationEntity({
        entityData: {
          source: {
            id: '1234',
            name: 'Account 1234',
            description: 'Account 1234',
          },
          assign: {
            _key: 'account:1234',
            _type: 'my_account',
            _class: 'Account',
          },
        },
      }),
    ]);
  },
};
