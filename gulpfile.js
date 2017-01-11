const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const runSequence = require('run-sequence');

gulp.task('build', () => {
    const b = babel({ presets: [ 'es2015' ] });

    return runSequence(['build:parser', 'build:schema']);
});

gulp.task('build:parser', () => {
    const b = babel({ presets: [ 'es2015' ] });

    return gulp.src('lib/parser.js')
        .pipe(b)
        .pipe(rename('index.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build:schema', () => {
    const b = babel({ presets: [ 'es2015' ] });

    gulp.src('lib/schema.js')
        .pipe(b)
        .pipe(gulp.dest('dist'));
});
