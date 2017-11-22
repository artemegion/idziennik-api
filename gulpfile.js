const gulp = require('gulp'),
      gutil = require('gulp-util'),
      file = require('gulp-file'),
      typescript = require('gulp-typescript');

gulp.task('build', ['build-typescript'], function()
{

});

gulp.task('build-typescript', function()
{
    const project = typescript.createProject('./src/ts/tsconfig.json', { charset: 'UTF-8' });

    let tsc = gulp
        .src('./src/ts/**/*.ts')
        .pipe(project(typescript.reporter.fullReporter(false)));

    return gutil.combine(
        file('index.d.ts', 'export * from "./dist/typings/index";'),
        tsc.dts.pipe(gulp.dest('./dist/typings')),
        tsc.js.pipe(gulp.dest('./dist'))
    );
});