import os from 'os';
import process from 'process';
import * as winston from 'winston';
import 'winston-logstash';
import config from '../config';

const hostname = os.hostname();

type LogFunction = (message: string, ...meta: any[]) => any;

export interface Logger {
  log: LogFunction;
  info: LogFunction;
  error: LogFunction;
  debug: LogFunction;
}

function createLogger(logPath: string, logstashPort: number) {
  const transports: winston.TransportInstance[] = [
    new winston.transports.Console(),
  ];

  if (config.isProduction) {
    transports.push(new winston.transports.File({ filename: logPath }));
  }

  if (config.logstashHost && config.isProduction) {
    transports.push(
      new (winston.transports as any).Logstash({
        name: 'logstash',
        port: logstashPort,
        node_name: hostname,
        ssl_enable: true,
        host: config.logstashHost,
      }),
    );
  }

  const logLevel = process.env.WINSTON_LOGLEVEL;
  const winstonConfig: winston.LoggerOptions = { transports };
  if (logLevel) {
    winstonConfig.level = logLevel;
  }
  return new winston.Logger(winstonConfig);
}

export const logger = createLogger(config.logPath, config.logPort);
export const jobsLogger = createLogger(config.jobsLogPath, config.jobsLogPort);

/** Close loggers to stop holding onto file handles */
export function closeLoggers() {
  logger.close();
  jobsLogger.close();
}

export default { logger, closeLoggers };
