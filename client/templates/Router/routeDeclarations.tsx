import React from 'react';
import loadable from '@loadable/component';
import { RouteProps } from 'react-router';
import LoadingPage from '../LoadingPage';

//
// The /* #__LOADABLE__ */ here are hints for @loadable/babel-plugin to
// do a transform
//

const HomePage = /* #__LOADABLE__ */ () => import('../HomePage');

export interface OurRouteProps extends RouteProps {
  /** The page name used for analytics */
  name: string;
  /** Function for loading the page asynchronously using async imports */
  loadFunction: (() => Promise<any>) | null;
}

/** An asynchronous route not bundled with the main bundle */
function route(
  path: string,
  loadFunction: () => Promise<any>,
  name: string,
  options: { exact?: boolean } = {},
): OurRouteProps {
  return {
    ...options,
    path,
    component: loadable(loadFunction, {
      fallback: <LoadingPage />,
    }),
    name,
    loadFunction,
  };
}

export const routes: OurRouteProps[] = [
  route('/', HomePage, 'HomePage', { exact: true }),
  route('/index', HomePage, 'HomePage'),
  route('*', HomePage, 'HomePage'),
];
