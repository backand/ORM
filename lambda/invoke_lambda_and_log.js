var base64 = require('base-64');
var invokeLambda = require('./invoke_lambda_function').invokeLambdaFunction;
var extractLogRequestId = require('./invoke_lambda_function').extractLogRequestId;
var _ = require('lodash');

function invokeLambdaAndLog(
	awsRegion, 
	accessKeyId, 
	secretAccessKey, 
	functionArn, 
	payload, 
	callback
	){
	var startTime = Date.now();
    invokeLambda(
    	awsRegion, 
    	accessKeyId, 
    	secretAccessKey, 
    	functionArn, 
    	payload, 
    	function(errInvoke, resultInvoke){
    	var endTime = Date.now();
        if (errInvoke){
            callback(errInvoke, null);
        }
        else{
            var logTail = base64.decode(resultInvoke.LogResult).split("\n");
            callback(null, _.extend(resultInvoke, { logs: logTail, startTime: startTime, endTime: endTime, requestId: extractLogRequestId(logTail) }));
            // var logTailLastLine = _.findLast(logTail, function(l){
            // 	return l.indexOf('END RequestId: ') > -1;
            // });
            // var requestId = logTailLastLine.replace(/END RequestId: /, '').replace(/\s/g, ' ').split(" ")[0].trim();
            // console.log("requestId=" + requestId);

            // var myFilter = (cb) => {
            // 	console.log('myFilter');
            // 	var fullLog = [];
            // 	async.until(() => { return fullLog.length > 0; }, function(foundLog){
            // 		setTimeout(() => {
	           //  		filterCloudwatchLogs(
			         //    	awsRegion, 
			         //    	accessKeyId, 
			         //    	secretAccessKey, 
			         //    	logGroupName, 
			         //    	requestId, 
			         //    	limit, 
			         //    	startTime,
			         //    	endTime,
				        //     function(errLog, log){
				        //     	console.log('filterCloudwatchLogs', errLog, log);           
				        //         if (errLog){
				        //             foundLog(errLog, []);
				        //         }
				        //         else {
            //                         fullLog = log;
				        //             foundLog(null, fullLog);
				        //         }
				        //     }
			         //    );
            // 		}, 1 * 60  * 1000);
            // 	}, cb);
            // }

            // var wrapped = async.timeout(myFilter, 5 * 60 * 1000);

            // wrapped(function(err, data){
            // 	console.log('wrapper', err, data);
            // 	if (err){
            //         callback(err, resultInvoke);
            //     }
            //     else {
            //         callback(null , _.extend(resultInvoke, { logs: data }));
            //     }
            // });

            
            
        }
    });
}

module.exports.invokeLambdaAndLog = invokeLambdaAndLog;