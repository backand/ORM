/**
 * Created by Dell on 9/5/2016.
 */
var AWS = require('aws-sdk');
var config = require('../configFactory').getConfig();
var cloudwatchevents = new AWS.CloudWatchEvents(config.AWSDefaultConfig);


function deleteCron(name, id, callback){
    console.log("deleteCron started " + name);
    
    cloudwatchevents.removeTargets({
        Ids: [id],
        Rule: name
    }, function(err, result) {
        if (err){
            console.error({cron:"RemoveTargets", name:name, err:err});
            callback(err, null);
        }
        else {
            cloudwatchevents.deleteRule({
                Name: name
            }, function(err, result) {
                if (err){
                    console.error({cron:"delete", name:name, err:err});
                    callback(err, null);
                }
                else {
                    console.log("deleteCron finished " + name);
                    callback(err, result);
                }
            });
        }
    });


}

module.exports.deleteCron = deleteCron;



