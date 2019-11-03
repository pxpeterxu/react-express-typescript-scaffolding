import { configure, addDecorator } from '@storybook/react';
import { HelmetProvider } from 'react-helmet-async';
import StoryRouter from 'storybook-react-router';
import * as React from 'react';
import { Provider } from 'mobx-react';
import { MainStore } from '../common/stores/MainStore';

const clientReq = require.context(
  '../client/templates',
  true,
  /\.stories\.tsx?$/,
);

const ProvidersDecorator = storyFn => {
  const store = new MainStore();
  return (
    <Provider store={store}>
      <HelmetProvider>{storyFn()}</HelmetProvider>
    </Provider>
  );
};
addDecorator(ProvidersDecorator);
addDecorator(StoryRouter());

function loadStories() {
  clientReq.keys().forEach(filename => clientReq(filename));
}

configure(loadStories, module);
