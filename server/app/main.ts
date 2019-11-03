import { Express } from 'express';
import index from './index';

function loadRoutes(app: Express) {
  app.use('*', index);

  return app;
}

export default loadRoutes;
