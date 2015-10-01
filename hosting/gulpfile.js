var gulp = require('gulp');
var watch = require('gulp-watch');
var awspublish = require('gulp-awspublish');
var _ = require('underscore');
var fs = require('fs');
var del = require('del');
var awspublishRouter = require("gulp-awspublish-router");

// get credentials
var credentials = JSON.parse(fs.readFileSync('aws-credentials.json', 'utf8'));

// create a new publisher using S3 options 
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property 
var publisherOptions = _.extend(credentials,   
  {
    params: {
      Bucket: 'backandhosting',
      ACL: "public-read"
    }
  }
);

var contentType = "text/plain";

// define custom headers 
var headers = {
	//'Cache-Control': 'max-age=315360000, no-transform, public'
	// ... 

	// ContentType: contentType
};


// upload new and changed only 
gulp.task('upload', function() {

	var publisher = awspublish.create(publisherOptions);
 
    return gulp.src('./src/**/*.*')

        // set content type
    	// .pipe(awspublishRouter({
     //        routes: {
     //            "^./src/(\w|-)+.jpg$": {
     //                headers: {
     //                    "Content-Type": "image/jpg"
     //                }
     //            },

     //            "^.+$": {
     //                headers: {
     //                    "Content-Type": "text/plain"
     //                }
     //            },

                


     //        }
     //    }))
 
	    // publisher will add Content-Length, Content-Type and headers specified above 
	    // If not specified it will set x-amz-acl to public-read by default 
	    .pipe(publisher.publish())
	 
	    // create a cache file to speed up consecutive uploads 
	    .pipe(publisher.cache())
	 
	     // print upload updates to console 
	    .pipe(awspublish.reporter());
});

// erase deleted files. upload new and changes only
gulp.task('sync', function() {

	var publisher = awspublish.create(publisherOptions);
 
	// this will publish and sync bucket files with the one in your public directory 
	gulp.src('./src/**/*.*')
	  .pipe(publisher.publish())
	  .pipe(publisher.sync())
	  .pipe(awspublish.reporter());

});

// clean cache of gulpfile if it gets confused about delete/insert of same file in same bucket
gulp.task('clean', function() {
	return del(['./.awspublish*']);
});