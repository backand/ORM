/**
 * Created by Dell on 9/5/2016.
 */
var AWS = require('aws-sdk')
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var cloudwatchevents = new AWS.CloudWatchEvents();


function putCron(name, schedule, lambdaArn, id, input, active, description, callback){
    console.log("putCron started " + name);
    console.log(JSON.stringify(input));
    var state = active == null || active == true ? "ENABLED" : "DISABLED";

    cloudwatchevents.putRule({
        Name: name,
        ScheduleExpression: schedule, //'rate(2 minutes)'
        State :state,
        Description : description
    }, function(err, result) {
        if (err){
            console.error({cron:"put", name:name, err:err});
            callback(err, null);
        }
        else {
            console.log({cron:"put", name:name, result:result});
            cloudwatchevents.putTargets({
                Rule: name,
                Targets: [{
                    Arn: lambdaArn, //arn:aws:lambda:us-east-1:328923390206:function:backandCron01
                    Id: id, //'1'
                    Input: JSON.stringify(input) // { "options":{ "hostname": "api.backand.com", "path": "/1/objects/action/items/?name=SendEmailMandrill&parameters={subject:'cc'}", "method": "GET", "headers": { "Authorization": "Basic ZjI3MThjYzQtZGIwYi00YmRhLWI5YTktZmE4NjJhMjlkMjRmOjJmMjdjNzgwLTY0YjYtMTFlNi1hMzlmLTBlZDcwNTM0MjZjYg=="}}}
                }]
            }, function (err, result) {
                console.log("putCron finished " + name);
                callback(err, result);
            });
        }
    });


}

module.exports.putCron = putCron;



