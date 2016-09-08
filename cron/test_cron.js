/**
 * Created by Dell on 9/5/2016.
 */

var name = "cronName06";
var schedule = "rate(1 minute)";
var lambdaArn = "arn:aws:lambda:us-east-1:328923390206:function:backandCron01";
var id = "a2a";
var input = {
    "options":{
        "hostname": "api.backand.com",
        "path": "/1/objects/action/items/?name=SendEmailMandrill&parameters={subject:'DD'}",
        "method": "GET",
        "headers": {
            "Authorization": "Basic ZjI3MThjYzQtZGIwYi00YmRhLWI5YTktZmE4NjJhMjlkMjRmOjJmMjdjNzgwLTY0YjYtMTFlNi1hMzlmLTBlZDcwNTM0MjZjYg=="
        }
    }
};

var putCron = require("./put_cron").putCron;
putCron(name, schedule, lambdaArn, id, input, function(err, data){
    console.log("test started");
    if(err){
        console.error(err);
    }
    else{
        console.log(data);
        // delete
        var deleteCron = require("./delete_cron").deleteCron;
        deleteCron(name, id, function(err, data){
            if(err){
                console.error(err);
            }
            else{
                console.log(data);
            }
        });
    }
});
