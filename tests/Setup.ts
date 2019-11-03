import db from '../server/libs/db';

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
