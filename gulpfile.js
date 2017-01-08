const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const gutil = require('gulp-util');

gulp.task('build', () => {
    const b = babel({ presets: [ 'es2015' ] });

    return gulp.src('lib/parser.js')
        .pipe(b)
        .pipe(rename('index.js'))
        .pipe(gulp.dest('dist'));
});
