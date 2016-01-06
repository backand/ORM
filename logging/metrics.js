/**
 * Created by backand on 1/6/16.
 */

var config = {
    hosts: [
        'ec2-52-3-33-37.compute-1.amazonaws.com:9200'
    ]
}


function monitor() {
    var appmetrics = require('appmetrics-elk').monitor(config);
}

module.exports.monitor = monitor;