import '../style/Styles.scss';

// Babel polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { loadableReady } from '@loadable/component';

import MainRouter from '../templates/Router/MainRouter';
import { ClientConfig } from '../../common/types';

declare global {
  interface Window {
    __CONFIG__: ClientConfig;
  }
}

const useServerSideRendering = window.__CONFIG__.shouldServerSideRender;

if (useServerSideRendering) {
  loadableReady(() => {
    ReactDOM.hydrate(
      React.createElement(MainRouter),
      document.getElementById('react-main'),
    );
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    // On the client, we don't do server-side rendering,
    // so just do a plain render
    ReactDOM.render(
      React.createElement(MainRouter),
      document.getElementById('react-main'),
    );
  });
}
