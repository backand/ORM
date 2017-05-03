var base64 = require('base-64');
var invokeLambda = require('./invoke_lambda_function').invokeLambdaFunction;
var extractLogRequestId = require('../list-s3/extract_lambda_requestid').extractLogRequestId;
var _ = require('lodash');

function invokeLambdaAndLog(
	awsRegion, 
	accessKeyId, 
	secretAccessKey, 
	functionArn, 
	payload, 
    isProduction,
	callback
	){
	var startTime = Date.now() - 1; 
    invokeLambda(
    	awsRegion, 
    	accessKeyId, 
    	secretAccessKey, 
    	functionArn, 
    	payload, 
        isProduction,
    	function(errInvoke, resultInvoke){
    	var endTime = Date.now() + 1; 
        if (errInvoke){
            callback(errInvoke, null);
        }
        else{
            var logTail = base64.decode(resultInvoke.LogResult).split("\n");
            callback(null, isProduction ? resultInvoke : _.extend(resultInvoke, { logs: logTail, startTime: startTime, endTime: endTime, requestId: extractLogRequestId(logTail) }));
        }
    });
}

module.exports.invokeLambdaAndLog = invokeLambdaAndLog;