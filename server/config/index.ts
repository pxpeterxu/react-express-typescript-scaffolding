import fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * Gets the filename for the database, defaulting to the dev database
 */
export function getDBEnvFile(envName?: string) {
  const files = {
    development: '.env.dbdev',
    production: '.env.dbprod',
    test: '.env.dbtest',
  };

  const defaultKey = 'development';
  return files[envName || defaultKey] || files[defaultKey];
}

function getWebEnvFile(envName?: string) {
  const files = {
    development: '.env.webdev',
    production: '.env.webprod',
    test: '.env.webtest',
  };

  const defaultKey = 'development';
  return files[envName || defaultKey] || files[defaultKey];
}

const dbEnvFile = getDBEnvFile(process.env.DATABASE);
const webEnvFile = getWebEnvFile(process.env.NODE_ENV);

// When webpacking on Windows and using the resulting file on a Mac,
// __dirname with backslashes doesn't play well
const dirname = __dirname.replace(/\\/g, '/');

dotenv.config({ path: `${dirname}/../${dbEnvFile}` });
dotenv.config({ path: `${dirname}/${dbEnvFile}` });
dotenv.config({ path: `${dirname}/../${webEnvFile}` });
dotenv.config({ path: `${dirname}/${webEnvFile}` });

export interface DbDetails {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Creates an object with host, port, user, password, database from the
 * environment variables defined in .env.db*
 */
export function createDbDetails(
  envObject: any,
  prefix: string = '',
): DbDetails {
  return {
    host: envObject[`${prefix}DB_HOST`] || 'localhost',
    port: envObject[`${prefix}DB_PORT`]
      ? parseInt(envObject[`${prefix}DB_PORT`], 10)
      : 3306,
    user: envObject[`${prefix}DB_USER`] || 'db_username',
    password: envObject[`${prefix}DB_PASS`] || '',
    database: envObject[`${prefix}DB_DATABASE`] || 'db_database',
  };
}

/**
 * Create a db connection URL that can be used in `new Sequelize(db)`
 */
export function createDbUrl(dbDetails: DbDetails) {
  return (
    `mysql://${dbDetails.user}:${dbDetails.password}@${dbDetails.host}` +
    `:${dbDetails.port}/${dbDetails.database}`
  );
}

const DEFAULT_WEB_PORT = 60987;

type Environment = 'production' | 'development' | 'test';

function readAndParseEnv(file: string) {
  if (fs.existsSync(file)) {
    return dotenv.parse(fs.readFileSync(file));
  } else {
    return {};
  }
}

export function loadConfig(database: Environment, nodeEnv: Environment) {
  const dbEnvFile = getDBEnvFile(database);
  const webEnvFile = getWebEnvFile(nodeEnv);
  const env: { [key: string]: string } = {
    ...readAndParseEnv(`${dirname}/../${dbEnvFile}`),
    ...readAndParseEnv(`${dirname}/${dbEnvFile}`),
    ...readAndParseEnv(`${dirname}/../${webEnvFile}`),
    ...readAndParseEnv(`${dirname}/${webEnvFile}`),
    NODE_ENV: nodeEnv,
    DATABASE: database,
  };

  const dbDetails = createDbDetails(env);
  const isProduction = env.NODE_ENV === 'production';
  const isDevelopment = !isProduction;

  return {
    web: {
      port: env.WEB_PORT || DEFAULT_WEB_PORT,
      host: env.WEB_HOST || `localhost:${DEFAULT_WEB_PORT}`,
      linkHost: (() => {
        if (env.WEB_HOST) {
          const isHttp = new RegExp(`:${DEFAULT_WEB_PORT}$`).test(env.WEB_HOST);
          const scheme = isHttp ? 'http' : 'https';
          return `${scheme}://${env.WEB_HOST}`;
        }

        return `http://localhost:${DEFAULT_WEB_PORT}`;
      })(),
    },
    db: createDbUrl(dbDetails),
    dbDetails,

    sessionsSchema: {
      tableName: 'Sessions',
      columnNames: {
        session_id: 'id',
        expires: 'expires',
        data: 'data',
      },
    },

    logPath: `${dirname}/../logs/log.txt`,
    jobsLogPath: `${dirname}/../logs/jobsLog.txt`,

    isProduction,
    isDevelopment,
    shouldServerSideRender: !isProduction,

    logstashHost: env.LOGSTASH_HOST,
    logPort: 59300,
    jobsLogPort: 59301,
  };
}

const config = loadConfig(
  (process.env.DATABASE as Environment) || 'development',
  (process.env.NODE_ENV as Environment) || 'development',
);

export default config;
