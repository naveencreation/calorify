// Force React's development build for tests. A globally-set NODE_ENV=production
// (common on Windows) makes React omit `act`, which breaks
// @testing-library/react-native (`actImplementation is not a function`).
process.env.NODE_ENV = 'test';

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@ds/(.*)$': '<rootDir>/src/design-system/$1',
    '^@ds$': '<rootDir>/src/design-system/index.ts',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
