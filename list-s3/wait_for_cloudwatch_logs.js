var async = require('async');
var filterCloudwatchLogs = require('./filter_cloudwatch_logs').filterCloudwatchLogs;

function waitLogs(	
	awsRegion, 
	accessKeyId, 
	secretAccessKey, 
	logGroupName, 
	awsRequestId, 
	limit,
	startTime,
	endTime, 
	logWaitPeriod,
	logTimesToWait,
	callback){

    var myFilter = (cb) => {
    	var fullLog = [];
    	async.until(() => { return fullLog.length > 0; }, function(foundLog){
    		setTimeout(() => {
        		filterCloudwatchLogs(
	            	awsRegion, 
	            	accessKeyId, 
	            	secretAccessKey, 
	            	logGroupName, 
	            	awsRequestId, 
	            	limit, 
	            	startTime,
	            	endTime,
		            function(errLog, log){          
		                if (errLog){
		                    foundLog(errLog, []);
		                }
		                else {
                            fullLog = log;
		                    foundLog(null, fullLog);
		                }
		            }
	            );
    		}, logWaitPeriod);
    	}, cb);
    }

    var wrapped = async.timeout(myFilter, logTimesToWait * logWaitPeriod);

    wrapped(function(err, data){
    	if (err){
            callback(err);
        }
        else {
            callback(null , data);
        }
    });


}

module.exports.waitLogs = waitLogs;