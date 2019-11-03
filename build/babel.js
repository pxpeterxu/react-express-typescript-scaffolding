const browserslistBrowsers = require('./browsers');

function getBabelRc(
  options = {
    /** Whether to transform modules into Node.JS-compatible includes */
    transformModules: true,
    /** Whether this is for the .babelrc.js or babel.config.js file; if not, will set "babelrc: false" */
    isBabelRc: false,
    /** Whether we're building for the client or server */
    isClient: false,
  },
) {
  const { transformModules, isBabelRc, isClient } = options;
  return {
    ...(isBabelRc ? {} : { babelrc: false }),
    presets: [
      [
        '@babel/preset-env',
        {
          targets: isClient ? browserslistBrowsers : { node: 'current' },
          modules: transformModules ? 'auto' : false,
        },
      ],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
    plugins: [
      ['lodash'],
      ['@babel/plugin-syntax-dynamic-import'],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@loadable/babel-plugin'],
    ],
  };
}

module.exports = getBabelRc;
