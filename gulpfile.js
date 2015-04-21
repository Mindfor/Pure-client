var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var del = require("del");
var mainBowerFiles = require("main-bower-files");

var paths = {
	lib: "lib",
	fonts: "fonts"
};

gulp.task("bower:clean", function () {
	return del(paths.lib);
});

gulp.task("bower:install", $.bower);

gulp.task("bower", ["bower:clean", "bower:install"], function () {
	return gulp.src(mainBowerFiles(), { base: "bower_components" })
		.pipe(gulp.dest(paths.lib));
});

gulp.task("fonts", function () {
	return gulp.src(paths.lib + "/font-awesome/fonts/*")
		.pipe(gulp.dest(paths.fonts));
});

gulp.task("default", ["bower","fonts"]);