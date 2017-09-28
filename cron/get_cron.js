/**
 * Created by Dell on 9/7/2016.
 */

var AWS = require('aws-sdk');
var config = require('../configFactory').getConfig();;



function getCron(namePrefix, callback){
    console.log("getCron started " + namePrefix);
    var cloudwatchevents = new AWS.CloudWatchEvents(config.AWSDefaultConfig);
    cloudwatchevents.listRules({
        NamePrefix: namePrefix,
        Limit : 100
    }, function(err, result) {
        if (err) console.error(err, err); // an error occurred
        else     console.log(result);       // successful response

        callback(err, result);
    });


}

module.exports.getCron = getCron;



