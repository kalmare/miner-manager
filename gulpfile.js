const gulp = require('gulp');
const babel = require('gulp-babel');
const electron = require('electron-connect').server.create();

const backend = 'src';
const frontend = 'view';
const build = 'build';

gulp.task('compile', callback => {
    const wait_max = 2;
    let wait_count = 0;

    function onEnd() {
        if (wait_max === ++wait_count) {
            callback();
        }
    }

    gulp.src(frontend+'/**/*.{html,css}')
        .pipe(gulp.dest(build))
        .on('end', () => {
            onEnd();
        });

    gulp.src(frontend+'/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest(build))
        .on('end', () => {
            onEnd();
        });
});

gulp.task('start', ['compile'], () => {
    electron.start();

    gulp.watch(frontend+'/**/*.{html,css,js}', ['compile', electron.reload]);

    gulp.watch(backend+'/**/*.js', electron.restart);
});
