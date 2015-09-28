var gulp = require('gulp');
var watch = require('gulp-watch');
var awspublish = require('gulp-awspublish');
var _ = require('underscore');

// get credentials
var credentials = JSON.parse(fs.readFileSync('aws-credentials.json', 'utf8')),

// create a new publisher using S3 options 
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property 
var publisherOptions = _.extend(credentials,   
  {
    params: {
      Bucket: 'hostexperiment'
    }
  }
);

var contentType = "text/plain";

// define custom headers 
var headers = {
	//'Cache-Control': 'max-age=315360000, no-transform, public'
	// ... 
	ACL: "public-read",
	ContentType: contentType
};

gulp.task('watch', function() {
	var publisher = awspublish.create(publisherOptions);
	return gulp.src('./src/**/*.*')
		.pipe(watch('./src/**/*.*'))
		.pipe(publisher.publish(headers))
		.pipe(publisher.cache())
		.pipe(awspublish.reporter());
});


 
gulp.task('upload', function() {

	var publisher = awspublish.create(publisherOptions);
 
    return gulp.src('./src/**/*.*')

 
	    // publisher will add Content-Length, Content-Type and headers specified above 
	    // If not specified it will set x-amz-acl to public-read by default 
	    .pipe(publisher.publish(headers))
	 
	    // create a cache file to speed up consecutive uploads 
	    .pipe(publisher.cache())
	 
	     // print upload updates to console 
	    .pipe(awspublish.reporter());
});