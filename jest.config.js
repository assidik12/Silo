const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',

  // Map the '@/' path alias to the project root (mirrors tsconfig.json paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Only pick up files inside __tests__
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
