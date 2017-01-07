const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const gutil = require('gulp-util');

gulp.task('build', () => {
    const b = babel({
        presets: [
            'es2015'
        ],
    });

    /*b.on('error', e => {
        gutil.log(e);
        b.end();
    });*/

    return gulp.src('lib/parser.js')
        .pipe(b)
        // .pipe(uglify())
        .pipe(rename('parser.js'))
        .pipe(gulp.dest('dist'));
});
