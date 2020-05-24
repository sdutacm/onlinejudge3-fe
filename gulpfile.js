/* eslint-disable @typescript-eslint/no-require-imports */
const gulp = require('gulp');
const rename = require('gulp-rename');
const run = require('gulp-run-command').default;
const watch = require('gulp-watch');

const dupDarkLessSuffix = '_duplicated4auto';
const dupDarkAntdSrc = './src/styles/dark_antd';
const dupDarkAntdDest = './src/styles/dark_antd_duplicated4auto';

function copyDupDarkLess() {
  // console.log(`[copy] src/dark.less -> src/dark${dupDarkLessSuffix}.less`);
  return gulp
    .src(['./src/dark.less'])
    .pipe(rename({ suffix: dupDarkLessSuffix }))
    .pipe(gulp.dest('./src/'));
}

gulp.task('copy-dup-dark-less', copyDupDarkLess);

gulp.task('watch-dup-dark-less', function () {
  return watch('./src/dark.less', {
    ignoreInitial: false,
  }, copyDupDarkLess);
});

gulp.task('copy-dup-dark-antd', function () {
  return gulp.src(dupDarkAntdSrc + '/**/*', { base: dupDarkAntdSrc })
    .pipe(gulp.dest(dupDarkAntdDest));
});


gulp.task('watch-dup-dark-antd', function () {
  return gulp.src(dupDarkAntdSrc + '/**/*', { base: dupDarkAntdSrc })
    .pipe(watch(dupDarkAntdSrc, { base: dupDarkAntdSrc }))
    .pipe(gulp.dest(dupDarkAntdDest));
});

gulp.task('npm-run-start', async () => run('npm start')());

gulp.task('dev', gulp.parallel(
  'copy-dup-dark-less',
  'watch-dup-dark-less',
  'watch-dup-dark-antd',
  'npm-run-start',
));

gulp.task('dup-less', gulp.series(
  'copy-dup-dark-less',
  'copy-dup-dark-antd',
));
