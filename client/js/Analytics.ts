import _ from 'lodash';
import { Event, EventData } from './Events';
import { ClientConfig } from '../../common/types';

type SerializedUser = any;
type AnalyticsJS = any; // SegmentAnalytics.AnalyticsJS;
type GoogleAnalytics = any; // UniversalAnalytics.ga

declare global {
  interface Window {
    __CONFIG__: ClientConfig;
    analytics?: AnalyticsJS;
    LogRocket?: any;
    ga?: GoogleAnalytics | null;
  }
}

/**
 * Whether LogRocket is enabled on this client instance.
 */
export function isLogRocketEnabled() {
  return (
    typeof window !== 'undefined' &&
    window.__CONFIG__ &&
    window.__CONFIG__.isProduction
  );
}

/** Track an event */
export function trackEvent(event: Event, data?: EventData) {
  return new Promise(resolve => {
    try {
      if (window.analytics) {
        window.analytics.track(event, data, resolve);
      }
      if (window.LogRocket) {
        window.LogRocket.track(event, data);
      }
    } catch (err) {
      console.error(err.stack);
      resolve();
    }
  });
}

/** Track a pageview */
export function trackPageview({
  pageName,
  path,
  referrer,
  params,
  isFirst,
}: {
  pageName: string | undefined;
  path: string;
  referrer?: string;
  params?: { [key: string]: string };
  /**
   * Whether this is the first page-view on page load, rather than
   * a Javascript-based navigation
   */
  isFirst: boolean;
}) {
  if (window.ga && !isFirst) {
    // Google analytics registers a page view on initialization, so we don't
    // need to register the first page view
    window.ga('set', 'page', path);
    window.ga('send', 'pageview', path);
  }

  if (window.analytics) {
    const prefix = `${location.protocol}//${location.host}`;
    window.analytics.page(pageName, {
      url: prefix + path,
      path,
      ...(referrer ? { referrer: prefix + referrer } : {}),
      ...params,
    });
  }
}

/** If a user just registered, alias their previous session */
export function alias(user: SerializedUser | null | undefined) {
  if (typeof window !== 'undefined' && user && window.analytics) {
    window.analytics.alias(user.id!.toString());
  }
}

/** If a user just logged in, identify them for analytics purposes */
export function identify(user: SerializedUser | null | undefined) {
  if (user) {
    const identifyOpts = {
      username: user.username,
      email: user.email,
      name: user.name,
    };

    if (typeof window !== 'undefined') {
      if (window.analytics) {
        window.analytics.identify(user.id!.toString(), identifyOpts);
      }

      if (window.LogRocket) {
        window.LogRocket.identify(user.id!.toString(), identifyOpts);
      }
    }
  }
}

/** Gets a cached event handler that will call trackEvent */
export function getTrackEventHandler(
  component: React.Component,
  event: Event,
  params: Object = {},
): () => void {
  const componentAny = component as any;

  // Use the component itself as the cache so that we don't leak
  // memory when the component is destroyed
  componentAny.__analyticsCache = componentAny.__analyticsCache || {};

  const key = JSON.stringify([event, params]);
  if (!componentAny.__analyticsCache[key]) {
    componentAny.__analyticsCache[key] = () => trackEvent(event, params);
  }

  return componentAny.__analyticsCache[key];
}

/**
 * Extracts the custom fields into a plain object to be included as metadata
 * within logging libraries.
 */
function extractCustomErrorData(error: Error) {
  const standardFields = ['message', 'stack', 'name'];

  const customData: { [key: string]: any } = {};

  // Capture the extra metadata on an error object too
  for (const key of Object.getOwnPropertyNames(error)) {
    if (standardFields.includes(key)) continue;
    customData[key] = error[key];
  }

  return customData;
}

/**
 * Logs an exception we've dealt with, but still should be sent to some
 * server for future diagnosis.
 */
export function logHandledError(error: Error) {
  console.error(error);
  if (!isLogRocketEnabled()) return;

  const extra = extractCustomErrorData(error);
  if (window.LogRocket) {
    window.LogRocket.captureException(
      error,
      Object.keys(extra).length > 0 ? { extra } : undefined,
    );
  }
}
