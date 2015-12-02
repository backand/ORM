/**
 * Created by backand on 12/2/15.
 */
var replace = require('replace-in-file');

var buildNumber = process.argv[2] || '1.8';

replace({
    "files" : [
        './socketio_server.js',
        './schema_server.js',
    ],
    "replace" : "build_version",
    "with" : buildNumber
}, function(err, detail){
    console.log(err, detail);
});

