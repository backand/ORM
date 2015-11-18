var gulp = require('gulp');
var upload = require('./index');



gulp.task('upload', function() {
    console.log('upload');
	return gulp.src('./src')
        .pipe(upload('dist', 'backand.hosting.net', './src', 'k1', '1a1c664c-a3e5-4db8-bf89-1ed79a78950e', '2b626399-8650-11e5-b5b9-12da56281408'));
});

gulp.task('clean', function() {
    console.log('clean');
	return gulp.src('./src/**/*.*')
        .pipe(upload('clean'));
});

gulp.task('default', ['upload']);