var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var tsify = require('tsify')
var ts = require('gulp-typescript')
var tsProject = ts.createProject("tsconfig.json")

gulp.task("ts", function() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/Bridge.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('build'))
})

gulp.task("html", function() {
    return gulp.src(['./src/*.html ', './src/*.js', './src/*.css'])
        .pipe(gulp.dest('build'))
})

gulp.task("default", ['ts', 'html'])