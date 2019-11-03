module.exports = {
  roots: ['<rootDir>/server', '<rootDir>/client', '<rootDir>/common'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx$': 'babel-jest',
    '^.+\\.ts$': 'babel-jest',
  },
  setupFilesAfterEnv: ['./tests/Setup.ts'],
};
