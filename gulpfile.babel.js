import gulp from 'gulp';
import swPrecache from 'sw-precache';
import swPrecacheConfig from './sw-precache-config';

const dist = 'build/default';

gulp.task('copy-extras', () => gulp.src([
    "preview-worker.js",
    "node_modules/dexie/dist/dexie.min.js",
    "bower_components/ace-builds/src-min-noconflict/{theme-,mode-,worker-}*.js"
  ], { base: '.' }).pipe(gulp.dest(dist))
);

gulp.task('generate-service-worker', ['copy-extras'], function(callback) {
  swPrecache.write(`${dist}/service-worker.js`, Object.assign({}, swPrecacheConfig, {
    stripPrefix: `${dist}/`,
    staticFileGlobs: swPrecacheConfig.staticFileGlobs.map(glob => `${dist}/${glob}`)
  }), callback);
});

gulp.task('default', ['copy-extras', 'generate-service-worker']);
