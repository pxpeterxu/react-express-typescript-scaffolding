const path = require('path');
const getWebpackConfig = require('./build/webpack');

const production = process.env.NODE_ENV === 'production';

module.exports = getWebpackConfig(
  {
    hasCss: true,
    minimize: production,
    useSourceMaps: !production,
    useCssSourceMaps: !production,
    production,
    splitChunks: true,
    emitLoadable: true,
  },
  {
    entry: {
      main: path.join(__dirname, 'client/js/InitWeb.ts'),
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist/app/server/public/js'),
    },
  },
);
