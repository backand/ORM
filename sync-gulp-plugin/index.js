// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var download = require('gulp-downloader');
var jeditor = require("gulp-json-editor");
var lazypipe = require('lazypipe');
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

var actions = require('./lazy-index');

// Consts
const PLUGIN_NAME = 'gulp-backand-s3-sync';

var sts_url = require('./config').sts_url;
var temporaryCredentialsFile = 'temporary-credentials.json';
var contentType = "text/plain";
var options = {};

var contentType = "text/plain";

function sts(user, pass){


    var username = user;
    var password = pass;

    var downloadOptions = {
      url: "http://" + username + ":" + password + "@" +   sts_url.replace(/http(s)?:\/\//, ''),
      method: 'POST'
    };
    var d = {
      fileName: temporaryCredentialsFile,
      request: downloadOptions
    };
    var mylazyPipe = lazypipe()
        .pipe(jeditor, 
            function(json) {   // must return JSON object.   
                console.log(json);
                var r = { 
                    accessKeyId: json.Credentials.AccessKeyId,
                    secretAccessKey: json.Credentials.SecretAccessKey,
                    sessionToken: json.Credentials.SessionToken
                };
                //get bucket and folder of S3 //--b hosting.backand.net --d qa08111
                options.b = json.Info.Bucket;
                options.d = json.Info.Dir;
                console.log("immediate", options);

                return r;
            }
        );
        
    return download(d)
        .pipe(mylazyPipe())
        .pipe(gulp.dest('.'));
}

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

}

// Plugin level function(dealing with files)
function gulpUploader(action, folder, bucket, dir, user, pass) {

  if (action == "dist"){
    if (!user || !pass) {
      throw new PluginError(PLUGIN_NAME, 'Missing username and password!');
    }
    else{
      console.log('sts');
      sts(user,pass);
      console.log("delayed", options);
    }
  }
  // else if (action == "clean"){
  //   return del(['./.awspublish*']);
  // }

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    // if (file.isBuffer()) {
    //   file.contents = Buffer.concat([prefixText, file.contents]);
    // }
    // if (file.isStream()) {
    //   file.contents = file.contents.pipe(prefixStream(prefixText));
    // }

    cb(null, doSomethingWithTheFile(file, folder, bucket, dir));

  });

}



function doSomethingWithTheFile(file){
  // return actions.dist(folder, bucket, dir); 
  return dist(file, options.b, options.d);
}

// Exporting the plugin main function
module.exports = gulpUploader;