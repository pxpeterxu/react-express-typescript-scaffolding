import requireDir from 'require-dir';
import db from '../libs/db';

requireDir('../models');
async function run() {
  try {
    await Promise.all([db.sync({ logging: console.log })]);
  } catch (err) {
    console.error(err.stack);
  }
  await db.close();
}

run();
