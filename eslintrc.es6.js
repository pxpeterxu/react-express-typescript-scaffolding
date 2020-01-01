const confusingBrowserGlobals = require('confusing-browser-globals');

const importExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.d.ts',
  '.native.ts',
  '.native.tsx',
];

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    node: true,
    jest: true,
  },

  plugins: ['react', '@typescript-eslint'],

  settings: {
    'import/extensions': importExtensions,
    'import/resolver': { node: { extensions: importExtensions } },
  },

  extends: [
    'plugin:react/recommended',
    'airbnb-typescript',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],

  rules: {
    // We use x != null to check if x !== null || x !== undefined
    eqeqeq: [2, 'allow-null'],
    'no-trailing-spaces': 2,
    // We use __BLAH__ to mark superglobals, and _blah for unused variables
    'no-underscore-dangle': 0,
    // We use if (X) { return blah }; else { ... } a lot: it's mostly a style thing
    'no-else-return': 0,
    // We like using for (const x of y), which is forbidden by this rule
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    // Functions and classes are hoisted, so can be used in any order. We also
    // use variables defined later in the file from functions, mostly for
    // const style = StyleSheet.create directives
    '@typescript-eslint/no-use-before-define': [
      2,
      { functions: false, classes: true, variables: false },
    ],
    // We use x++ extensively, and it's not too harmful
    'no-plusplus': 0,
    // Destructuring (const { blah } = obj; vs. const blah = obj.blah;) really doesn't make much of a difference
    'prefer-destructuring': 0,
    // We use console.log in scripts extensively. We should probably pull it out
    'no-console': 0,
    // We prefer classes to stateless functions because they can be PureComponents. Eventually, we may want to switch to React.memo
    'react/prefer-stateless-function': 0,
    // We're okay with having apostrophes, quotes, etc. be unescaped in React code: it's Javascript, so we can include UTF-8
    'react/no-unescaped-entities': 0,
    'import/first': 0, // For mocks, mocks must come first
    'import/no-cycle': 0, // We often have dependency cycles right now, especially for types
    'import/prefer-default-export': 0, // Files often have one function
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'react/destructuring-assignment': 0, // We often use this.props.X directly
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'eslintrc*',
          '**/*.test.*',
          '**/*.stories.*',
          'server/scripts/db.ts',
          '**/tests/**',
          'gulpfile*',
          'mobile/storybook/**/*',
          '**/__mocks__/**',
        ],
      },
    ],
    'jsx-a11y/label-has-associated-control': 0, // This rule seems flaky
    'react/no-did-update-set-state': 0, // We do setState in componentDidUpdate as an alternative to componentWillReceiveProps
    'react/no-access-state-in-setstate': 0, // This is mostly fine, and addressing this actually makes the code harder to read
    'react/jsx-no-target-blank': 0, // We only want noopener, not noreferrer for target="_blank"
    'lines-between-class-members': 0, // We often put related class members in React components together
    'no-restricted-imports': [
      2,
      {
        paths: [
          {
            // Encourage us to use mobile component library components
            name: 'react-native',
            importNames: ['Button', 'Text', 'TextInput'],
            message:
              "Don't import React Native components also in our component library: use our components from mobile/Components instead to keep our styles consistent and bug free",
          },
          {
            // There's some initialization logic around Firebase
            name: 'firebase-admin',
            message:
              "Don't import firebase-admin directly; instead, use `getFirebaseClient()` in server/libs/firebase",
          },
        ],
      },
    ],
    // We like our React defaultProps defined as `static defaultProps = { ... }` in the class
    'react/static-property-placement': [2, 'static public field'],
    // We spread props to avoid having to repeatedly pass lots of props down. This is a bit worse
    // for performance and typechecking though, so there is a trade-off (e.g., if we accidentally
    // pass props that aren't needed but cause re-renders)
    'react/jsx-props-no-spreading': 0,
    // We initialize state:
    // - In the constructor if we need to do something else in the constructor
    // - In the class body (state: State = {...}) if otherwise there's no constructor work needed
    // Since there's no version of this rule that accommodates that, we disable it
    'react/state-in-constructor': 0,
    // In quite a few places (e.g., FakeData), we both export individual functions and
    // the functions again in the default export. This avoids warning against using one
    // or the other
    'import/no-named-as-default-member': 0,
    // We don't sort components, except making sure that render comes at the end
    'react/sort-comp': [
      2,
      {
        order: ['everything-else', '/^render[A-Z].+$/', 'render'],
      },
    ],
    // Airbnb doesn't allow using isNaN, but isNaN and isFinite are safe with
    // type-checking. We just use them
    'no-restricted-globals': [2, ...confusingBrowserGlobals],
    // We like putting methods near where they're used, and that might be inside
    // a class even if they don't use `this`
    'class-methods-use-this': 0,
    // We nest ternaries in render() methods for React so that we can do more
    // complex decision trees
    'no-nested-ternary': 0,
    // Template strings are not necessarily more readable
    'prefer-template': 0,
    // Most boolean values are flags; however, sometimes, boolean values are used
    // in the `value` prop and are significant
    'react/jsx-boolean-value': [2, 'never', { always: ['value'] }],
    // We don't use React PropTypes since we're on Typescript
    'react/prop-types': 0,
  },
};
