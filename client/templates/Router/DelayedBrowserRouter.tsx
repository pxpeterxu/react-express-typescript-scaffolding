import React from 'react';
import { Router, matchPath } from 'react-router';
import {
  createBrowserHistory,
  LocationListener,
  Location,
  Action,
  History,
} from 'history';
import { OurRouteProps } from './routeDeclarations';

interface Props {
  routes: OurRouteProps[];
  onLoadingChange: (loading: boolean) => unknown;
}

function createDelayedBrowserHistory({
  routes,
  onLoadingChange,
}: Props): History<any> {
  const history = createBrowserHistory();
  let listeners: LocationListener[] = [];

  let loadingLocation: Location<any> | null = null;

  const delayedHistory = {
    ...history,
    listen: (listener: LocationListener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
  };

  function notifyListeners(location: Location<any>, action: Action) {
    delayedHistory.location = location;
    for (const listener of listeners) {
      listener(location, action);
    }
  }

  history.listen(async (location: Location<any>, action: Action) => {
    const match = routes.find(r => !!matchPath(location.pathname, r));

    // If we have a route that requires asynchronous fetching, fetch it,
    // then notify of the change
    if (match && match.loadFunction) {
      let loadFunction = match.loadFunction;

      // The @loadable/babel-plugin will transform load functions sometimes;
      // use their format
      if (typeof match.loadFunction === 'object') {
        const loadObject: {
          isReady: (arg: {}) => boolean;
          requireAsync: () => Promise<any>;
        } = match.loadFunction as any;

        if (loadObject.isReady({})) {
          onLoadingChange(false);
          notifyListeners(location, action);
          return;
        } else {
          loadFunction = loadObject.requireAsync.bind(loadObject);
        }
      }

      try {
        onLoadingChange(true);
        loadingLocation = location;
        await loadFunction();
      } catch (err) {
        // Swallow error
        console.error(err);
      }

      // This check makes sure we haven't switched to yet another route in
      // the meantime already
      if (loadingLocation === location) {
        loadingLocation = null;
        onLoadingChange(false);
        notifyListeners(location, action);
      }
    } else {
      // Otherwise, notify of change immediately
      notifyListeners(location, action);
    }
  });

  return delayedHistory;
}

/**
 * A <Router> that uses HTML5 history, except also waiting until we've
 * lazy-loaded a page to show the new route
 */
export default class DelayedBrowserRouter extends React.Component<Props> {
  history = createDelayedBrowserHistory(this.props);

  render() {
    return <Router history={this.history}>{this.props.children}</Router>;
  }
}
