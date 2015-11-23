var gulp = require('gulp');
var request = require('request');
var fs = require('fs');
var upload = require('./index');

var localFolder = './src';

gulp.task('dist', function() {

	var dist = upload();
	// console.log(dist);
	return gulp.src(localFolder)
    .pipe(dist());
});

gulp.task('clean', function() {
  console.log('clean');
  //TODO: Add return del(['./.awspublish*']);
	//return gulp.src(localFolder + '/**/*.*')
   // .pipe(upload('clean'));
});

gulp.task('sts', function(){

  var username = '1a1c664c-a3e5-4db8-bf89-1ed79a78950e';
  var password = '2b626399-8650-11e5-b5b9-12da56281408';

  var url = "http://" + username + ":" + password + "@" + "api.backand.co:8099/1/hosting";
	return request.post(url).pipe(fs.createWriteStream('temporary-credentials.json'));
});

gulp.task('default', ['dist']);