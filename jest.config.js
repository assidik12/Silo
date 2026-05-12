const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Default environment for component tests (.tsx).
  // Server-side tests (.ts) override with @jest-environment node docblock.
  testEnvironment: 'jsdom',

  // Map the '@/' path alias to the project root (mirrors tsconfig.json paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Pick up all test files inside __tests__
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  // Register global setup (jest-dom matchers) after test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = createJestConfig(customJestConfig);

