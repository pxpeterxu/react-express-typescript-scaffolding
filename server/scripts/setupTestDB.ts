import requireDir from 'require-dir';
import sequelize from 'sequelize';
import db from '../libs/db';

requireDir('../models');

async function createDatabase(db: sequelize.Sequelize) {
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.sync({ logging: console.log, force: true });
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Done');
  await db.close();
}

async function main() {
  try {
    for (const curDb of [db]) {
      // eslint-disable-next-line no-await-in-loop
      await createDatabase(curDb);
    }
  } catch (err) {
    console.error('Ran into error while creating databases');
    console.error(err.stack);
  }
}

main();
