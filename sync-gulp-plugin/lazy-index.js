var gulp = require('gulp');
var watch = require('gulp-watch');
var awspublish = require('gulp-awspublish');
var _ = require('underscore');
var fs = require('fs');
var del = require('del');
var awspublishRouter = require("gulp-awspublish-router");
var minimist = require('minimist');
var rename = require("gulp-rename");

var parallelize = require("concurrent-transform");
var lazypipe = require('lazypipe');




var temporaryCredentialsFile = 'temporary-credentials.json';


var contentType = "text/plain";






function dist(folder, bucket, dir) {

    // get credentials
    var credentials = JSON.parse(fs.readFileSync(temporaryCredentialsFile, 'utf8'));

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


    var publisher = awspublish.create(publisherOptions);
 
    // this will publish and sync bucket files with the one in your public directory 
    return layzpipe()

        // rename extensions to lower case
        .pipe(rename(function (path) {
            path.extname = path.extname.toLowerCase();
        }))

        // set content type
        .pipe(awspublishRouter({
            routes: {

                "[\\w/\-\\s\.]*\\.css$": {
                    headers: {
                        "Content-Type": "text/css"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.js$": {
                    headers: {
                        "Content-Type": "application/javascript"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.jpg$": {
                    headers: {
                        "Content-Type": "image/jpg"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.ico$": {
                  headers: {
                    "Content-Type": "image/x-icon"
                  },
                  key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.jpeg$": {
                    headers: {
                        "Content-Type": "image/jpg"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.gif$": {
                    headers: {
                        "Content-Type": "image/gif"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.png$": {
                    headers: {
                        "Content-Type": "image/png"
                    },
                    key: dir + "/" + "$&"
                },

                "[\\w/\-\\s\.]*\\.html": {
                  headers: {
                    "Content-Type": "text/html"
                  },
                  key: dir + "/" + "$&"
                },

                "^.+$": {
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    key: dir + "/" + "$&"
                },

            }
        }))
        
        // publisher will add Content-Length, Content-Type and headers specified above 
        // If not specified it will set x-amz-acl to public-read by default 
        //.pipe(publisher.publish())
        .pipe(parallelize(publisher.publish(), 10))
        
        .pipe(publisher.sync(dir + "/"))
        
        // create a cache file to speed up consecutive uploads 
        .pipe(publisher.cache())
    
        // print upload updates to console     
        .pipe(awspublish.reporter());

};

// clean cache of gulpfile if it gets confused about delete/insert of same file in same bucket
function clean() {
    return lazypipe()
            .del(['./.awspublish*']);
};

module.exports = {
    clean: clean
}