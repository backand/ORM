/**
 * Created by Dell on 9/7/2016.
 */

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var cloudwatchevents = new AWS.CloudWatchEvents();


function getCron(namePrefix, callback){
    console.log("getCron started " + namePrefix);

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



