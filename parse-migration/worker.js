/**
 * Created by backand on 2/8/16.
 */
process.chdir(__dirname);

var fs = require("fs");

fs.watchFile(__filename, function(curr,prev) {
    console.log("close process for update");
    process.exit();
});


var Worker = require('./workerInner').Worker;
var worker = new Worker();
worker.run();
