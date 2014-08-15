var gulp = require('gulp');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');
var rimraf = require('gulp-rimraf');
var jshint = require('gulp-jshint');

gulp.task('jshint', function () {
    return gulp.src('./src/client/js/**/*.js')
        .pipe(jshint({
            camelcase: true,
            curly: true,
            eqeqeq: true,
            undef: true,
            globals: {
                module: true,
                require: true,
                console: true
            }
        }))
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify.prod', function () {
    return gulp.src('./src/client/js/application.js')
        .pipe(browserify())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('browserify.dev', function () {
    return gulp.src('./src/client/js/application.js')
        .pipe(browserify({debug: true}))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('clean', function () {
    return gulp.src('./public/js/**/*.js', {read: false})
        .pipe(rimraf());
});

gulp.task('build.dev', function () {
    return runSequence('clean', 'jshint', 'browserify.dev');
});

gulp.task('build.prod', function () {
    return runSequence('clean', 'browserify.prod');
});

gulp.task('watch', function () {
    return gulp.watch('./src/client/js/**/*.js', ['build.dev']);
});

gulp.task('default', ['build.prod']);
