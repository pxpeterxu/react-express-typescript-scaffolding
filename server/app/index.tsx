import express, { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { useStaticRendering } from 'mobx-react';
import { ChunkExtractor } from '@loadable/server';
import path from 'path';
import fs from 'fs';
import { HelmetProvider, FilledContext } from 'react-helmet-async';

import { logger } from '../libs/logger';
import '../../client/templates/FontAwesome';
import Routes from '../../client/templates/Router/Routes';
import config from '../config';
import DefaultHead from '../../client/templates/Router/DefaultHead';
import { logError } from '../../common/logging';
import { serializeForScript } from '../../common/serializeForScript';
import { MainStore } from '../../common/Stores/MainStore';
import { ClientConfig } from '../../common/types';

//
// For @loadable/component: loads all code-split asynchronous includes
// on the server side before returning to client
//
const statsFile = path.join(
  __dirname,
  '../public/compiled/loadable-stats.json',
);
let splitCodeExtractor: ChunkExtractor | null = null;
if (config.shouldServerSideRender) {
  if (fs.existsSync(statsFile)) {
    splitCodeExtractor = new ChunkExtractor({ statsFile });
  } else {
    logger.warn(
      "Server-side rendering is on, but we couldn't find loadable-stats.json to make sure code-split components are loaded",
    );
    splitCodeExtractor = null;
  }
}

// We should do this to avoid leaking memory per documentation at:
// https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering
useStaticRendering(true);

const router = express.Router();

/**
 * Asynchronously load all the data required on a render by reading renderProps
 * @param req           express request object
 * @return store to use, or null if redirected
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function loadData(req: Request) {
  return { store: new MainStore({}) };
}

async function handleRequest(req: Request, res: Response) {
  try {
    const result = await loadData(req);
    if (!result) return; // We got redirected
    const { store } = result;

    res.type('text/html');

    const context: any = {};
    const helmetContext: FilledContext = {} as any;

    let app = (
      // <Provider store={store}>
      <StaticRouter location={req.originalUrl} context={context}>
        <HelmetProvider context={helmetContext}>
          <DefaultHead />
          <Routes loading={false} />
        </HelmetProvider>
      </StaticRouter>
      // </Provider>
    );
    let scriptTags = '';

    if (splitCodeExtractor) {
      app = splitCodeExtractor.collectChunks(app);
      scriptTags = splitCodeExtractor.getScriptTags();
    }

    const rendered = renderToString(app);

    res.status(context.is404 ? 404 : 200);

    if (context.url) {
      res.redirect(302, context.url);
    } else {
      const helmet = helmetContext.helmet;

      res.render('index', {
        title: helmet.title.toString(),
        meta: helmet.meta.toString(),
        link: helmet.link.toString(),
        style: helmet.style.toString(),
        script: helmet.script.toString(),
        scriptTags,
        noscript: helmet.noscript.toString(),
        // Only do server-side rendering in production
        react: config.shouldServerSideRender ? rendered : '',
        bodyAttributes: helmet.bodyAttributes.toString(),

        // We use json-stringify-safe here because stores
        // often refer to their parents, but we don't need
        // those circular references
        storeJSON: serializeForScript(store),
        config: {
          shouldServerSideRender: config.shouldServerSideRender,
          isProduction: config.isProduction,
        } as ClientConfig,

        baseUrl: '',
      });
    }
  } catch (err) {
    logError(logger.error, err);
    res
      .status(500)
      .send('An unexpected error occurred; please try again later');
  }
}

router.get('*', handleRequest);

export default router;
