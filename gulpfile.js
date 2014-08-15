var gulp = require('gulp');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');
var rimraf = require('gulp-rimraf');
var jshint = require('gulp-jshint');
var manifest = require('gulp-manifest');
var mainBowerFiles = require('main-bower-files');
var templateCache = require('gulp-angular-templatecache');
var minifyHTML = require('gulp-minify-html');

var MANIFEST_FILE_NAME = 'manifest.appcache';
var CLIENT_PATH = 'src/client';
var ASSETS_PATH = CLIENT_PATH + '/assets';
var TEMPLATE_PATH = CLIENT_PATH + '/templates';
var DIST_PATH = 'public';
var LIB_PATH = DIST_PATH + '/lib';
var BOWER_PATH = 'bower_components';
var JS_PATH = 'src/client/js';
var MAIN_JS_PATH = JS_PATH + '/application.js';
var JS_DIST_PATH = DIST_PATH + '/js';

var MANIFEST_OPTIONS = {
    timestamp: true,
    preferOnline: false,
    network: ['http://*', 'https://*', '*'],
    filename: MANIFEST_FILE_NAME,
    exclude: [
        'index.html',
        MANIFEST_FILE_NAME
    ]
};

var JSHINT_OPTIONS = {
    camelcase: true,
    curly: true,
    eqeqeq: true,
    undef: true,
    globals: {
        module: true,
        require: true,
        console: true
    }
};

gulp.task('templateCache', function () {
    return gulp.src(TEMPLATE_PATH + '/**/*')
        .pipe(minifyHTML())
        .pipe(templateCache({
            standalone: true,
            root: 'views/'
        }))
        .pipe(gulp.dest(JS_DIST_PATH));
});

gulp.task('assets', function () {
    return gulp.src(ASSETS_PATH + '/**/*')
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('bower', function () {
    return gulp.src(mainBowerFiles(), {base: BOWER_PATH})
        .pipe(gulp.dest(LIB_PATH));
});

gulp.task('manifest', function () {
    gulp.src(DIST_PATH + '/**/*')
        .pipe(manifest(MANIFEST_OPTIONS))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('jshint', function () {
    return gulp.src(JS_PATH + '/**/*.js')
        .pipe(jshint(JSHINT_OPTIONS))
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify.prod', function () {
    return gulp.src(MAIN_JS_PATH)
        .pipe(browserify())
        .pipe(gulp.dest(JS_DIST_PATH));
});

gulp.task('browserify.dev', function () {
    return gulp.src(MAIN_JS_PATH)
        .pipe(browserify({debug: true}))
        .pipe(gulp.dest(JS_DIST_PATH));
});

gulp.task('clean',function () {
    return gulp.src(DIST_PATH, {read: false})
        .pipe(rimraf());
});

gulp.task('build.dev', function () {
    return runSequence('jshint', 'browserify.dev');
});

gulp.task('build.prod', function () {
    return runSequence('browserify.prod');
});

gulp.task('dev', function () {
    return runSequence('clean', 'bower', 'assets', 'templateCache', 'build.dev', 'manifest');
});

gulp.task('prod', function () {
    return runSequence('clean', 'bower', 'assets', 'templateCache', 'build.prod', 'manifest');
});

gulp.task('default', ['prod']);
