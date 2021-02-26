const gulp = require('gulp');
// const composer = require('gulp-uglify/composer');
const uglifyes = require('uglify-es');
// const uglify = composer(uglifyes, console);
const sass = require("gulp-sass");
const sassGlob = require('gulp-sass-glob');
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const cleanCSS = require("gulp-clean-css");
const svgstore = require("gulp-svgstore");
const clean = require("gulp-clean");
const svgmin = require("gulp-svgmin");
const path = require("path");
const imagemin = require("gulp-imagemin");
const fileinclude = require("gulp-file-include");
const cache = require("gulp-cache");
const pathExists = require('path-exists');
const browserSync = require("browser-sync").create();

function swallowError(error) {
    console.log(error.toString());
    this.emit("end");
}

function images() {
    return gulp.src(["src/assets/images/*/*.*", "src/assets/images/svg/*.*", "src/assets/images/*.*"])
        .pipe(cache(imagemin()))
        .on('error', swallowError)
        .pipe(gulp.dest("dist/assets/images"));
}

function html() {
    return gulp.src("src/index.html")
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@root'
        }))
        // .pipe(htmlmin({ collapseWhitespace: true, minifyJS: true }))
        .on('error', swallowError)
        .pipe(gulp.dest("dist/"));
}

function scripts() {
    return gulp.src([
        "node_modules/jquery/dist/jquery.js",
        "node_modules/owl.carousel/dist/owl.carousel.js",
        "src/components/**/*.js"
        ])
        .pipe(concat("main.js"))
        // .pipe(uglify())
        .on('error', swallowError)
        .pipe(gulp.dest("dist/assets/js"));
}

function sassTask() {
    return gulp.src("src/assets/sass/main.scss")
        .pipe(sassGlob())
        .pipe(sass({
            includePaths: ['node_modules']
        }))
        .on("error", swallowError)
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/assets/css"))
}

function watchFiles() {
    gulp.watch(["src/components/**/*.html", "src/components/index.html"], gulp.series(html, reload));
    gulp.watch(["src/components/**/*.scss", "src/assets/sass/*.scss"], gulp.series(sassTask, reload));
    gulp.watch(["src/images/*/*.*", "assets/images/svg/*.*", "assets/images/*.*"], gulp.series(images, reload));
}

function reload(done) {
    browserSync.reload();
    done();
}

function server(done) {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
    });
    done();
}

const develop = gulp.parallel(html, scripts, images, sassTask);

module.exports = {
    dev: gulp.series(develop, server, watchFiles),
    watch: gulp.series(watchFiles)
}