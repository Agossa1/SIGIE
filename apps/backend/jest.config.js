/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Définit la racine pour la recherche des tests
  roots: ['<rootDir>/src'],
  // Cherche tous les fichiers se terminant par .spec.ts
  testMatch: ['**/*.spec.ts'],
  // Transformation des fichiers TypeScript via ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Support des alias si vous en utilisez (ex: @/shared/...)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  verbose: true,
};