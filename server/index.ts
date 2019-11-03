#!/usr/bin/env node
import 'source-map-support/register';
import { AddressInfo } from 'net';
import app from './app';
import config from './config';

app.set('port', process.env.PORT || config.web.port);

const server = app.listen(app.get('port'), () => {
  console.info(
    `Express server listening on port ${
      (server.address() as AddressInfo).port
    }: ${config.isProduction ? 'production' : 'development'}, database ${
      config.dbDetails.host
    } ${config.dbDetails.database}`,
  );
});
