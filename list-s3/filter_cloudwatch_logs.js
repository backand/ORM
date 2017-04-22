var AWS = require('aws-sdk');

function filterCloudwatchLogs(awsRegion, accessKeyId, secretAccessKey, logGroupName, awsRequestId, callback){
	AWS.config.update({ 'accessKeyId': accessKeyId, 'secretAccessKey': secretAccessKey, 'region': awsRegion });
	var cloudwatchlogs = new AWS.CloudWatchLogs();
	var params = {
	  logGroupName: logGroupName, /* required */
	  // endTime: 0,
	  filterPattern: '"' + awsRequestId + '"',
	  interleaved: true,
	  // limit: 0,
	  // logStreamNames: [
	  //   'STRING_VALUE',
	  // ],
	  // nextToken: 'STRING_VALUE',
	  // startTime: 0
	};
	cloudwatchlogs.filterLogEvents(params, function(err, data) {
	  if (err) {
	  	// console.log(err, err.stack); // an error occurred
	  	callback(err);
	  }
	  else {
	  	// console.log(data);           // successful response
	  	callback(err, data.events);
	  }    
	  /*

		{ events: 
		   [ { logStreamName: '2017/04/19/[$LATEST]2b8bb9977a054227a018889be3557c90',
		       timestamp: 1492607083256,
		       message: 'START RequestId: c15414a8-2500-11e7-b729-5d79c826357c Version: $LATEST\n',
		       ingestionTime: 1492607083433,
		       eventId: '33286250245214040066088215357182899874747345273147555840' },
		     { logStreamName: '2017/04/19/[$LATEST]2b8bb9977a054227a018889be3557c90',
		       timestamp: 1492607083266,
		       message: '2017-04-19T13:04:43.266Z\tc15414a8-2500-11e7-b729-5d79c826357c\t{"errorMessage":"something is wrong","errorType":"Error","stackTrace":["exports.handler (/var/task/index.js:3:17)"]}\n',
		       ingestionTime: 1492607098597,
		       eventId: '33286250245437047518073521606930365710430758268056371200' },
		     { logStreamName: '2017/04/19/[$LATEST]2b8bb9977a054227a018889be3557c90',
		       timestamp: 1492607083266,
		       message: 'END RequestId: c15414a8-2500-11e7-b729-5d79c826357c\n',
		       ingestionTime: 1492607098597,
		       eventId: '33286250245437047518073521606930365710430758268056371201' },
		     { logStreamName: '2017/04/19/[$LATEST]2b8bb9977a054227a018889be3557c90',
		       timestamp: 1492607083266,
		       message: 'REPORT RequestId: c15414a8-2500-11e7-b729-5d79c826357c\tDuration: 7.04 ms\tBilled Duration: 100 ms \tMemory Size: 128 MB\tMax Memory Used: 20 MB\t\n',
		       ingestionTime: 1492607098597,
		       eventId: '33286250245437047518073521606930365710430758268056371202' } ],
		  searchedLogStreams: 
		   [ { logStreamName: '2017/04/16/[$LATEST]21d1c6f5d0ba4affb2c77b2188deab60',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]3c20bcd562974c979f8f947326ae2fc8',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]660b3ff36ee44c3da2641df0df2ec8c0',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]949133303ae54813b962423b1ebef905',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]9a65a2a2208b4473869bc02cd11f0941',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]a865e79b00934e108c1c36c80df2f9f8',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]b6f8febe2fd446668c5230cbaa07a154',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/16/[$LATEST]f1c3b6548d3143b698e49aa52b4f1573',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/19/[$LATEST]2b8bb9977a054227a018889be3557c90',
		       searchedCompletely: true },
		     { logStreamName: '2017/04/19/[$LATEST]924f5cf12c734b2dad10e1d23d418abf',
		       searchedCompletely: true } ] 
		}

	  */
	  callback(err, data);
	});
}

module.exports.filterCloudwatchLogs = filterCloudwatchLogs;

// filterCloudwatchLogs('us-east-1', "AKIAJQIZGYS3N4IPFCVA", "VY4DmqWHeWNPmR9et9EP8+cLHKq2aNvucH36ltcx", '/aws/lambda/fwcb', 'c15414a8-2500-11e7-b729-5d79c826357c', function(err, data){
// 	console.log(err);
// 	console.log(data);
// 	process.exit(1);
// });