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
} = require('./gulpfile.lib');

const configFile = `${__dirname}/dev/dev.config.js`;
const devConfig = fs.existsSync(configFile)
  ? require('./dev/dev.config') // eslint-disable-line
  : require('./dev/dev.config.example');

const serverWatchGlobs = {};
const clientWatchGlobs = {};

const production = process.env.NODE_ENV === 'production';

// Base client tasks
const buildClientJSWebpackArgs = {
  sourceFile: 'client/js/InitWeb.ts',
  destDir: 'dist/app/server/public/js',
  destFile: 'main.js',
  cssDestDir: 'dist/app/server/public/assets',
  production,
  watch: false,
};

createBuildClientJSWebpackTask('build-client-js', buildClientJSWebpackArgs);

createBuildClientJSWebpackTask('watch-client-js', {
  ...buildClientJSWebpackArgs,
  watch: true,
});

createCopyGulpTask(
  'copy-assets',
  'client/assets/{**/*,*}',
  'dist/app/server/public/assets',
  clientWatchGlobs,
);

// Client tasks
gulp.task('build-client', gulp.parallel(['copy-assets', 'build-client-js']));
createWatchTask('start-watching-client', clientWatchGlobs);

gulp.task(
  'watch-client',
  gulp.series(
    gulp.parallel(['copy-assets', 'watch-client-js']),
    'start-watching-client',
  ),
);

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

if (!production) {
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
  'dist/app/server/public/assets/main.css',
  'dist/app/server/public/assets',
  'dist/app/server/public/js',
  production,
);

createBuildViewsTask('build-views', {
  glob: 'server/views/*.ejs',
  dest: 'dist/app/server/views',
  revManifestPath: 'dist/app/server/public/js/rev-manifest.json',
  production,
  watchGlobs: serverWatchGlobs,
});

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

const runWatchGlobs = ['dist/app', '!dist/app/server/public'];

gulp.task(
  'build-server',
  gulp.parallel([
    'build-server-js',
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

gulp.task('watch-all', gulp.series('watch-client', 'watch-server'));

gulp.task('all', gulp.series('watch-all'));

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
