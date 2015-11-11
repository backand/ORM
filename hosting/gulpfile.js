var gulp = require('gulp');
var watch = require('gulp-watch');
var awspublish = require('gulp-awspublish');
var _ = require('underscore');
var fs = require('fs');
var del = require('del');
var awspublishRouter = require("gulp-awspublish-router");
var minimist = require('minimist');
var options = minimist(process.argv.slice(2));

var temporaryCredentialsFile = 'temporary-credentials.json';


switch(options._[0])
{
    case "dist":
        if (!options.f || !options.b || !options.d){
            console.log("usage: sync: node_modules/gulp/bin/gulp.js dist --f /path/to/project/folder --b backandbucket --d /folder/in/backand/bucket");
            process.exit(1);
        }
    break;
    case "clean":
    break;
    default:
        console.log("unknown task");
        process.exit(1);
    break;
}




// get credentials
var credentials = JSON.parse(fs.readFileSync(temporaryCredentialsFile, 'utf8'));

// folder of project
var folder = options.f;

// bucket
var bucket = options.b;


var dir = options.d

// create a new publisher using S3 options 
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property 
var publisherOptions = _.extend(credentials,   
  {
    params: {
      Bucket: bucket,
      // ACL: "public-read"
    },
    logger: process.stdout
  }
);

var contentType = "text/plain";

// define custom headers 
// var headers = {
// 	//'Cache-Control': 'max-age=315360000, no-transform, public'
// 	// ... 

// 	// ContentType: contentType
// };


// erase deleted files. upload new and changes only
gulp.task('dist', function() {

	var publisher = awspublish.create(publisherOptions);
 
	// this will publish and sync bucket files with the one in your public directory 
	gulp.src(folder + '/**/*.*')

        // set content type
        .pipe(awspublishRouter({
            routes: {

                "[\\w/]*\.css$": {
                    headers: {
                        "Content-Type": "text/css"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\.js$": {
                    headers: {
                        "Content-Type": "application/javascript"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\.jpg$": {
                    headers: {
                        "Content-Type": "image/jpg"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\.jpeg$": {
                    headers: {
                        "Content-Type": "image/jpg"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\.gif$": {
                    headers: {
                        "Content-Type": "image/gif"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\.png$": {
                    headers: {
                        "Content-Type": "image/png"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/]*\\.\w*": {
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    key: dir + "/" + "$&"
                },

            }
        }))
	    
        // publisher will add Content-Length, Content-Type and headers specified above 
        // If not specified it will set x-amz-acl to public-read by default 
        .pipe(publisher.publish())
	    
        .pipe(publisher.sync())
        
        // create a cache file to speed up consecutive uploads 
        .pipe(publisher.cache())
	
        // print upload updates to console     
        .pipe(awspublish.reporter());

});

// clean cache of gulpfile if it gets confused about delete/insert of same file in same bucket
gulp.task('clean', function() {
	return del(['./.awspublish*']);
});