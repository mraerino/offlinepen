import gulp from 'gulp';

const dist = 'build/default';

gulp.task('copy-extras', () => gulp.src([
    "preview-worker.js",
    "node_modules/dexie/dist/dexie.js",
    "bower_components/ace-builds/src-min-noconflict/{theme-,mode-,worker-}*.js"
  ], { base: '.' }).pipe(gulp.dest(dist))
);
