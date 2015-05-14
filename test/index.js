var gulp = require('gulp');
var less = require('gulp-less');

describe('#css', function () {
	it('pure.less', function (done) {
		gulp.src('pure.less')
			.pipe(less({
				paths: [ "bower_components/pure-client" ]
			}))
			.pipe(gulp.dest("test/.temp"))
			.on('end', done);
	});

	it('css-pages/admin.less', function (done) {
		gulp.src('css-pages/admin.less')
			.pipe(less({
				paths: [ "bower_components/pure-client" ]
			}))
			.pipe(gulp.dest("test/.temp"))
			.on('end', done);
	});
	
	it('css-pages/focus.less', function (done) {
		gulp.src('css-pages/focus.less')
			.pipe(less({
				paths: [ "bower_components/pure-client" ]
			}))
			.pipe(gulp.dest("test/.temp"))
			.on('end', done);
	});
});