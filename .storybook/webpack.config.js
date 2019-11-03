const path = require('path');
const autoprefixer = require('autoprefixer');

const browsersListBrowsers = ['>0.5% in US', 'not Android >0'];

module.exports = ({ config }) => {
  // Add Typescript extensions
  config.resolve.extensions.push('.ts', '.tsx');
  config.module.rules[0].test = /\.(jsx?|tsx?)$/;
  config.module.rules.push({
    test: /\.scss$/,
    loaders: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: [autoprefixer({ browsers: browsersListBrowsers })],
        },
      },
      'sass-loader',
    ],
    include: path.resolve(__dirname, '..'),
  });
  config.node = { fs: 'empty' };

  return config;
};
