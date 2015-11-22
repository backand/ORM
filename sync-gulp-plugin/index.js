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
var async = require('async');
var parallelize = require("concurrent-transform");
var asyncPipe = require('gulp-async-func-runner');


// Consts
const PLUGIN_NAME = 'gulp-backand-s3-sync';

//var sts_url = require('./config').sts_url;
//
//
//function sts(user, pass){
//
//  console.log("sts", user, pass);
//
//    var username = user;
//    var password = pass;
//
//    var downloadOptions = {
//      url: "http://" + username + ":" + password + "@" +   sts_url.replace(/http(s)?:\/\//, ''),
//      method: 'POST'
//    };
//    var d = {
//      fileName: temporaryCredentialsFile,
//      request: downloadOptions
//    };
//    var mylazyPipe = lazypipe()
//        .pipe(jeditor,
//            function(json) {   // must return JSON object.
//                console.log(json);
//                var r = {
//                    accessKeyId: json.Credentials.AccessKeyId,
//                    secretAccessKey: json.Credentials.SecretAccessKey,
//                    sessionToken: json.Credentials.SessionToken
//                };
//                return r;
//            }
//        );
//
//    return download(d)
//        .pipe(mylazyPipe())
//        .pipe(gulp.dest('.'));
//}


function dist(dir, publisher) {

    console.log("dist", dir, publisher);

    // this will publish and sync bucket files with the one in your public directory 
  var l;
  l = lazypipe()

  // rename extensions to lower case
      .pipe(rename, function (path) {
        console.log("rename", path);
        path.extname = path.extname.toLowerCase();
      })

      .pipe(function () {
        console.log("create router");
        return awspublishRouter({
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
        });
      })

      .pipe(function () {
        console.log("myParallelize");
        //return parallelize(publisher.publish(), 10);
        return publisher.publish();
      })

      .pipe(function () {
        console.log("mySync");
        return publisher.sync(dir + "/");
      })

      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache)

      // print upload updates to console
      .pipe(awspublish.reporter);

  console.log(l);
    return l;

}


// Plugin level function(dealing with files)
function gulpUploader(folder) {

    var text = fs.readFileSync('temporary-credentials.json','utf8');
    var json = JSON.parse(text);

    var credentials = {
        accessKeyId: json.Credentials.AccessKeyId,
        secretAccessKey: json.Credentials.SecretAccessKey,
        sessionToken: json.Credentials.SessionToken
    };

    var publisherOptions = _.extend(credentials,
      {
        params: {
          Bucket: json.Info.Bucket,
          // ACL: "public-read"
        },
        logger: process.stdout
      }
    );

    var publisher = awspublish.create(publisherOptions);
    return dist(folder, publisher);
}


// Exporting the plugin main function
module.exports = gulpUploader;