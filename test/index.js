var gulp = require('gulp');
var less = require('gulp-less');

describe('#css', function () {
	it('css-mf/_all.less', function (done) {
		gulp.src('css-mf/_all.less')
			.pipe(less())
			.on('end', done);
	});

	it('css-pages/admin.less', function (done) {
		gulp.src('css-pages/admin.less')
			.pipe(less())
			.on('end', done);
	});
	
	it('css-pages/focus.less', function (done) {
		gulp.src('css-pages/focus.less')
			.pipe(less())
			.on('end', done);
	});
});