var gulp = require('gulp');
var request = require('request');
var fs = require('fs');
var upload = require('./index');
var sts_url = require('./config').sts_url;
var temporaryCredentialsFile = 'temporary-credentials.json';


var username = '1a1c664c-a3e5-4db8-bf89-1ed79a78950e';
var password = '2b626399-8650-11e5-b5b9-12da56281408';
var url = "http://" + username + ":" + password + "@" +   sts_url.replace(/http(s)?:\/\//, '');

gulp.task('dist', function() {
	var dist = upload('dist', './src', username, password);
	console.log(dist);
	return gulp.src('./src')
        .pipe(dist());
});

gulp.task('clean', function() {
    console.log('clean');
	return gulp.src('./src/**/*.*')
        .pipe(upload('clean'));
});

gulp.task('sts', function(){
	return request.post(url).pipe(fs.createWriteStream(temporaryCredentialsFile));
});

gulp.task('default', ['dist']);