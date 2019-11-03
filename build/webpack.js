const webpack = require('webpack');

const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const autoprefixer = require('autoprefixer');

const getBabelRc = require('./babel');

const browsersListBrowsers = ['>0.5% in US', 'not Android >0'];

/** Gets a webpack configuration suited to the use case/build environment */
function getWebpackConfig(
  options = {
    /**
     * Whether we're compiling any CSS: if so, will add the loaders
     * and plugins needed
     */
    hasCss: true,
    /** Whether we're compiling with source maps (usually for non-production) */
    useSourceMaps: false,
    /** Whether we're compiling with CSS source maps (usually for non-production) */
    useCssSourceMaps: false,
    /** Whether to minimize/uglify (usually for production) */
    minimize: false,
    /** Whether we're building for production (for the Webpack mode) */
    production: false,
    /** Whether to code-split; if false, will limit to single chunk */
    splitChunks: false,
    /**
     * Whether to emit loadable-stats.json for use for server-side rendering after
     * code-splitting
     */
    emitLoadable: false,
  },
  /** Extra configuration keys (e.g., entry, output) to merge */
  extraConfigToMerge = {},
) {
  const {
    hasCss,
    useSourceMaps,
    useCssSourceMaps,
    minimize,
    production,
    splitChunks,
    emitLoadable,
  } = options;

  const commonCssLoaders = [
    { loader: MiniCssExtractPlugin.loader },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2, // Indicates both post-css and sass-loaders are used before this
        sourceMap: useSourceMaps,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        ident: 'postcss',
        plugins: [autoprefixer({ browsers: browsersListBrowsers })],
        sourceMap: useSourceMaps,
        map: { inline: true },
      },
    },
  ];

  /**
   * Building for browsers requires a slightly different babelrc
   * compared to for node.js
   */
  const buildClientBabelOpts = getBabelRc({
    transformModules: false,
    isBabelRc: false,
    isClient: true,
  });

  const webpackConfig = {
    mode: production ? 'production' : 'development',
    ...extraConfigToMerge,
    devtool: useSourceMaps ? 'cheap-module-eval-source-map' : false,
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx'],
    },
    node: {
      fs: 'empty',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|mjs|ts|tsx)$/,
          // These libraries uses some ES6 syntax
          exclude: /node_modules\/(?!quill|copy-text-to-clipboard)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                ...buildClientBabelOpts,
                cacheDirectory: true,
              },
            },
          ],
        },
      ].concat(
        hasCss
          ? [
              {
                test: /\.s?css$/,
                use: commonCssLoaders.concat([
                  {
                    loader: 'sass-loader',
                    options: { sourceMap: useSourceMaps },
                  },
                ]),
              },
              {
                test: /\.less$/,
                use: commonCssLoaders.concat([
                  {
                    loader: 'less-loader',
                    options: {
                      javascriptEnabled: true,
                      sourceMap: useSourceMaps,
                    },
                  },
                ]),
              },
            ]
          : [],
      ),
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      ...(emitLoadable ? [new LoadablePlugin()] : []),
    ],
    optimization: {
      // For mysterious reasons, concatenateModules results in the error
      // "Object(...) is not a function" or
      // "__webpack_require__(...) is not a function" (pre-minification)
      // as mentioned here: https://github.com/webpack/webpack/issues/6544
      concatenateModules: false,
      minimizer: minimize
        ? [
            new TerserPlugin({
              cache: true,
              parallel: true,
              sourceMap: true,
            }),
            ...(hasCss ? [new OptimizeCSSAssetsPlugin({})] : []),
          ]
        : undefined,
    },
  };

  if (hasCss) {
    webpackConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name]-[id].css',
        sourcemap: false,
      }),
    );
  }

  // We don't really use sourcemaps on mobile
  if (useCssSourceMaps && hasCss) {
    // This is to generate sourcemaps for CSS files; workaround from
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/29#issuecomment-382424129
    webpackConfig.plugins.push(
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: ['/vendor/'],
      }),
    );
  }

  if (!splitChunks) {
    webpackConfig.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    );
  }

  return webpackConfig;
}

module.exports = getWebpackConfig;
