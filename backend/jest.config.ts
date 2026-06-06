import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Look for tests in the tests folder
  testMatch: ['**/tests/**/*.test.ts'],

  // Collect coverage from all source files
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],

  // Give integration tests enough time to complete
  testTimeout: 30000,
};

export default config;