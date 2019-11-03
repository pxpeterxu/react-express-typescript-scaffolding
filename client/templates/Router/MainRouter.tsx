import React from 'react';
import _ from 'lodash';
import { Provider } from 'mobx-react';
import { ScrollContext } from 'react-router-scroll-4';
import { HelmetProvider } from 'react-helmet-async';
import { update } from 'react-updaters';
import Routes from './Routes';
import DelayedBrowserRouter from './DelayedBrowserRouter';
import { routes } from './routeDeclarations';
import DefaultHead from './DefaultHead';
import { MainStoreData, MainStore } from '../../../common/stores/MainStore';

declare global {
  interface Window {
    __MOBX_STATE__: MainStoreData;
  }
}

const mobxState = window.__MOBX_STATE__;

interface State {
  /** Whether we're loading any routes using async code-splitting */
  loading: false;
}

export default class MainRouter extends React.Component<{}, State> {
  store: MainStore;

  constructor(props: {}) {
    super(props);

    // Only instantiate the store on creation; that way, all requires/imports
    // will have been completed first, and LogRocket will have been initialized
    // for analytics purposes

    this.store = new MainStore(mobxState);
    this.state = { loading: false };
  }

  render() {
    const { loading } = this.state;

    return (
      <Provider store={this.store}>
        <DelayedBrowserRouter
          routes={routes}
          onLoadingChange={update(this, 'loading')}
        >
          <ScrollContext>
            <>
              <HelmetProvider>
                <DefaultHead />
                <Routes loading={loading} />
              </HelmetProvider>
            </>
          </ScrollContext>
        </DelayedBrowserRouter>
      </Provider>
    );
  }
}
