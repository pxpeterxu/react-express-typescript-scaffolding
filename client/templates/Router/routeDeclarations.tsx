import React from 'react';
import loadable from '@loadable/component';
import { observer } from 'mobx-react';
import { RouteProps } from 'react-router';
import LoadingPage from '../LoadingPage';
import { MainStore } from '../../../common/Stores/MainStore';

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
  let LoadableComponent = loadable(loadFunction, {
    fallback: <LoadingPage />,
  });

  // We need to make the LoadableComponent an observer - otherwise when we
  // navigate to a URL of the same page, we trigger a reload if the page
  // uses any MobX injectors.
  //
  // Without this line, navigating to the same page would cause the React
  // Component tree to render without the `InnerLoadable` component between
  // the `<Route>` and the component inside the `InnerLoadable`.
  //
  // See https://gitlab.com/travelchime/itineraries/snippets/1921343 for
  // screenshots on how the tree changes
  LoadableComponent = observer(LoadableComponent);

  // `index.tsx` calls `loadData` to properly server-side render pages, but the
  // layers of loadable and MobX observers hide the loadData. This function
  // helps expose loadData from the depths
  const loadData = async (store: MainStore, match: any) => {
    // Despite the typings, the `import` statements get transformed by babel
    // into objects. See https://loadable-components.com/docs/babel-plugin/#transformation
    // for more details
    const loadAny: any = loadFunction;
    if (!(loadAny && loadAny.requireSync)) return;
    const loadedModule = loadAny.requireSync();
    if (!(loadedModule && loadedModule.default)) return;
    let ModuleComponent = loadedModule.default;
    if (!ModuleComponent) return;

    // If we found a MobX Component, traverse down until we find a loadData
    // function or run out of nested MobX components
    while (
      ModuleComponent &&
      !ModuleComponent.loadData &&
      ModuleComponent.WrappedComponent
    ) {
      ModuleComponent = ModuleComponent.WrappedComponent;
    }

    if (ModuleComponent && ModuleComponent.loadData) {
      await ModuleComponent.loadData(store, match);
    }
  };
  (LoadableComponent as any).loadData = loadData;

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
