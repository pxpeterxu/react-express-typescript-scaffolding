import Sequelize from 'sequelize';
import config from '../config';

// Connect to the database
const db = new Sequelize(config.db, {
  logging: false,
});

export default db;
