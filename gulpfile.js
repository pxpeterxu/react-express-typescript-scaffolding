const fs = require('fs');
const gulp = require('gulp');
const {
  createBuildClientJSWebpackTask,
  createBuildServerJSTask,
  createWatchTask,
  createRevRenameTask,
  createBuildViewsTask,
  createCreateDirectoriesGulpTask,
  createCopyGulpTask,
  createRunServerTask,
  createSyncTask,
  createDeleteTask,
  createWebpackDevServerTask,
} = require('./gulpfile.lib');

const configFile = `${__dirname}/dev/dev.config.js`;
const devConfig = fs.existsSync(configFile)
  ? require('./dev/dev.config') // eslint-disable-line
  : require('./dev/dev.config.example');

const serverWatchGlobs = {};

const production = process.env.NODE_ENV === 'production';
const shouldServerSideRender =
  production || !!process.env.SHOULD_SERVER_SIDE_RENDER;

// Base client tasks
const buildClientJSWebpackArgs = {
  sourceFile: 'client/js/InitWeb.ts',
  destDir: 'dist/app/server/public/compiled',
  destFile: 'main.js',
  cssDestDir: 'dist/app/server/public/compiled',
  /** Requires both slashes. See https://webpack.js.org/configuration/output/#outputpublicpath */
  publicPath: '/compiled/',
  production,
  watch: false,
};

createBuildClientJSWebpackTask('build-client-js', buildClientJSWebpackArgs);
createWebpackDevServerTask('watch-client-js', buildClientJSWebpackArgs);
// This version writes the client code to the filesystem, instead of just
// having it in-memory via `webpack-dev-server`. This is helpful for debugging
// server-side rendering
createBuildClientJSWebpackTask('watch-client-js-ssr', {
  ...buildClientJSWebpackArgs,
  watch: true,
});

// Client tasks
gulp.task('build-client', gulp.series('build-client-js'));
gulp.task('watch-client', gulp.series('watch-client-js'));
gulp.task('watch-client-ssr', gulp.series('watch-client-js-ssr'));

// Base server tasks
createBuildServerJSTask({
  name: 'build-server-js',
  globs: [
    '{server,server/config/.env.*,client/{entry,js,templates},common,tests}/**/*.ts?(x)',
    '!**/*.test.ts?(x)',
    '!**/*.d.ts',
  ],
  destination: 'dist/app',
  serverWatchGlobs,
});

if (!shouldServerSideRender) {
  // In development, we generally don't need to rebuild/restart the
  // server for client changes since we don't do server-side rendering
  serverWatchGlobs['build-server-js'] = [
    '{server,common}/**/*.ts?(x)',
    '!**/*.test.ts?(x)',
    '!**/*.d.ts',
  ];
}

// We only rename the CSS file; the Javascript file gets renamed by Webpack
// and substituted in using @loadable/webpack-plugin
createRevRenameTask(
  'rev-rename-client',
  'dist/app/server/public/compiled/main.css',
  'dist/app/server/public/compiled',
  'dist/app/server/public/compiled',
  production,
);

createBuildViewsTask('build-views', {
  glob: 'server/views/*.ejs',
  dest: 'dist/app/server/views',
  revManifestPath: 'dist/app/server/public/compiled/rev-manifest.json',
  production,
  watchGlobs: serverWatchGlobs,
});

createCopyGulpTask(
  'copy-assets',
  'client/assets/{**/*,*}',
  'dist/app/server/public/assets',
  serverWatchGlobs,
);

createCopyGulpTask(
  'copy-static',
  '{{client,server,tests}/**/{*.json,.env*,*.scss},server/templates/**/*.ejs}',
  'dist/app',
  serverWatchGlobs,
);

gulp.task(
  'rename-and-copy-client',
  gulp.series('rev-rename-client', 'build-views'),
);

createCreateDirectoriesGulpTask('create-log-dir', ['dist/app/server/logs']);

// Main server tasks
const sanitizedNodeEnv = production ? 'production' : 'development';
const env = {
  ...process.env,
  NODE_ENV: sanitizedNodeEnv,
  // Allow APP_MODE and DATABASE to be overridden: e.g., DATABASE=production gulp all
  APP_MODE: process.env.APP_MODE || sanitizedNodeEnv,
  DATABASE: process.env.DATABASE || sanitizedNodeEnv,
};

const runWatchGlobs = ['dist/app'];

if (!shouldServerSideRender) {
  // If server-side-rendering, we restart the server even on client JS changes.
  // In all other cases, only restart the server on server changes
  runWatchGlobs.push('!dist/app/server/public');
}

gulp.task(
  'build-server',
  gulp.parallel([
    'build-server-js',
    'copy-assets',
    'copy-static',
    'rename-and-copy-client',
    'create-log-dir',
  ]),
);

createRunServerTask(
  'run-server',
  'dist/app/server/bin/www.js',
  runWatchGlobs,
  env,
);
createWatchTask('start-watching-server', serverWatchGlobs);

createDeleteTask('clean', ['dist']);

gulp.task(
  'watch-server',
  gulp.series('build-server', 'start-watching-server', 'run-server'),
);

// Overall tasks
// 1. For building the web server and client
gulp.task('build-all', gulp.series('build-client', 'build-server'));

gulp.task('watch-all', gulp.parallel(['watch-client', 'watch-server']));

async function ensureServerSideRenderingEnabled() {
  if (!shouldServerSideRender) {
    throw new Error(
      'SHOULD_SERVER_SIDE_RENDER=1 must be set to run this command',
    );
  }
}

gulp.task(
  'watch-all-ssr',
  gulp.series(
    ensureServerSideRenderingEnabled,
    gulp.parallel(['watch-client-ssr', 'watch-server']),
  ),
);

gulp.task('all', gulp.series('watch-all'));

gulp.task('all-ssr', gulp.series('watch-all-ssr'));

// Sync tasks
const syncGlobs = [
  './build',
  './client',
  './common',
  './server',
  './sysadmin',
  './tests',
  './package.json',
  './yarn.lock',
  './*.js',
  './*.ts',
  './babel.config.js',

  // Configuration files for various tools
  './.gitlab-ci.yml',
];
const syncWatchGlobs = [
  '{build,server,client,common,sysadmin,tests}/**',
  'server/config/.env.*',
  'package.json',
  'yarn.lock',
  'gulpfile*',
  '*.js',
  '*.ts',
  './babel.config.js',
  './.gitlab-ci.yml',
];
createSyncTask('run-sync', syncGlobs, {
  username: devConfig.username,
  hostname: devConfig.syncServer,
  destination: '/home/web/app',
  root: './',
  archive: true,
  silent: false,
  compress: true,
  recursive: true,
  emptyDirectories: true,
});

gulp.task('watch-sync', async () => {
  gulp.watch(syncWatchGlobs, gulp.parallel(['run-sync']));
});

gulp.task('sync', gulp.parallel(['run-sync', 'watch-sync']));
