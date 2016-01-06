/**
 * Created by backand on 12/2/15.
 */

// build!
var buildNumber = process.argv[2] || '1.8';
console.log(__dirname);

var fs = require('fs');

var pattern = "var version = '##';  module.exports.version = version;";

var formatted = pattern.replace('##', buildNumber);
fs.writeFile("./version.js", formatted, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});



