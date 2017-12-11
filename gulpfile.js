const gulp = require('gulp');
const babel = require('gulp-babel');
const electron = require('electron-connect').server.create();

const backend = 'src';
const frontend = 'view';
const build = 'build';

gulp.task('compile', () => {
    gulp.src(frontend+'/**/*.{html,css}')
        .pipe(gulp.dest(build));

    return gulp.src(frontend+'/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest(build));
});

gulp.task('start', ['compile'], () => {
    electron.start();

    gulp.watch(frontend+'/**/*.{html,css}', electron.reload);

    gulp.watch(frontend+'/**/*.js', ['compile']);

    gulp.watch(backend+'/**/*.js', electron.restart);
});
