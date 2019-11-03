#!/usr/bin/env node
import 'source-map-support/register';
import { AddressInfo } from 'net';
import app from '../app';
import config from '../config';
import { logger } from '../libs/logger';
import { logError } from '../../common/logging';

main();

async function main() {
  app.set('port', process.env.PORT || config.web.port);

  process.on('uncaughtException', error => {
    logError(logger.error, error);
  });

  const server = app.listen(app.get('port'), () => {
    logger.info(
      `Express server listening on port ${
        (server.address() as AddressInfo).port
      }: ${config.isProduction ? 'production' : 'development'}, node ${
        process.env.NODE_ENV
      }, database ${config.dbDetails.host} ${config.dbDetails.database}`,
    );
  });
}
