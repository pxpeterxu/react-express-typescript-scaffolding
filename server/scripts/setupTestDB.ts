import requireDir from 'require-dir';
import sequelize from 'sequelize';
import db from '../libs/db';

requireDir('../models');

async function createDatabase(dbInstance: sequelize.Sequelize) {
  await dbInstance.query('SET FOREIGN_KEY_CHECKS = 0');
  await dbInstance.sync({ logging: console.log, force: true });
  await dbInstance.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Done');
  await dbInstance.close();
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
