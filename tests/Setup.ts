import db from '../server/libs/db';
import {
  setCurrentSuite,
  clearCurrentSuite,
  setCurrentTest,
  clearCurrentTest,
} from './TestState';

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled rejection:');
  console.error(err.stack);
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await db.close();
});

if ('jasmine' in global) {
  const jasmineAny: any = (global as any).jasmine;
  // Based on documentation at https://jasmine.github.io/tutorials/custom_reporter
  // We update the currently running state so that tests can access the current
  // test name or filename for logging messages or adding it to cache-files
  jasmineAny.getEnv().addReporter({
    suiteStarted: setCurrentSuite,
    suiteDone: clearCurrentSuite,
    specStarted: setCurrentTest,
    specDone: clearCurrentTest,
  });
}
