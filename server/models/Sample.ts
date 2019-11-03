import Sequelize from 'sequelize';
import db from '../libs/db';

/**
 * This is a sample table defined in Sequelize. When you run `yarn test`,
 * the table will be created automatically.
 *
 * After you add a new model file like this one, you can create the tables
 * in your dev database by running `yarn init-db-dev`.
 */
export interface SampleAttributes {
  id?: number;
  myNumber: number;
  myShortString: string;
  myLongText: string | null;
}

export type SampleInstance = Sequelize.Instance<SampleAttributes> &
  SampleAttributes;

const Sample = db.define<SampleInstance, SampleAttributes>(
  'Sample',
  {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    myNumber: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    },
    myShortString: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
    myLongText: {
      type: Sequelize.TEXT('medium'),
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        name: 'myNumber_myShortString',
        fields: ['myNumber', 'myShortString'],
        unique: true,
      },
      {
        name: 'myShortString',
        fields: ['myShortString'],
      },
    ],
  },
);

export default Sample;
