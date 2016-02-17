/**
 * Created by backand on 2/8/16.
 */
process.chdir(__dirname);


var Worker = require('./workerInner').Worker;
var worker = new Worker();
worker.run();
