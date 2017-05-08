process.chdir(__dirname);
var path = process.env.TESTPATH || '../';

var filterLogs = require(path + 'list-s3/filter_cloudwatch_logs').filterCloudwatchLogs;
var invokeLambdaAndLog = require(path + 'lambda/invoke_lambda_and_log').invokeLambdaAndLog;

var async = require('async');

function invoke(n, callback) {
   invokeLambdaAndLog(
	    'us-east-1', 
	    "AKIAJQIZGYS3N4IPFCVA", 
	    "VY4DmqWHeWNPmR9et9EP8+cLHKq2aNvucH36ltcx", 
	    'arn:aws:lambda:us-east-1:328923390206:function:cli_items_blueredwhite',
	    {},
	    false,
	    function(err, data){
	        // console.log(err);
	        // console.log(data);
	        callback(null, data.requestId);
	    }
	);
}

function getLog(id, callback) {
	filterLogs(
		'us-east-1', 
		"AKIAJQIZGYS3N4IPFCVA", 
		"VY4DmqWHeWNPmR9et9EP8+cLHKq2aNvucH36ltcx",
		'/aws/lambda/cli_items_blueredwhite', 
		id, 
		10000, 
		1493806519089,
		1493806519091,
		function(err, d){
			callback(null, d);
		}
	);
}

var callThenLog = async.compose(getLog, invoke);
callThenLog(4, function (err, result) {
    console.log(err);
    console.log(result);
    process.exit(0);
});
