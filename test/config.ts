import dotenv from 'dotenv';
import path from 'path';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../src';
import { GitlabIntegrationConfig } from '../src/types';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const instanceConfig: GitlabIntegrationConfig = {
  baseUrl: process.env.BASE_URL || 'https://gitlab.com',
  personalToken: process.env.PERSONAL_TOKEN || 'personal-token',
};

export function getStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    invocationConfig: invocationConfig as any,
    stepId,
    instanceConfig,
  };
}
