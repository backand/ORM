var logEntry = 'log_api';

var moment = require('moment');

var RedisDataSource = require('../logger-reply/sources/RedisDataSource');

function NodejsLogger(source) {
	this.source = source;
	this.redisDataSource = new RedisDataSource();
}

NodejsLogger.prototype.log = function (msg){
    this.redisDataSource.insertEvent(msg, function(err, data){});
}

NodejsLogger.prototype.logFields = function (req,
	typeOfMessage, 
	nodeModule, 
	action, 
	message, 
	trace,
){
	var msg = {
		Source: "NodeJS",
		ID: req.ID,
		LogType: (typeOfMessage == "exception" ? "1" : "3"), 
		ExceptionMessage: (typeOfMessage == "exception" ? message : ""),
		LogMessage: (typeOfMessage != "exception" ? message : ""),	
		ApplicationName: this.source, 
		Username: req.headers.username, 
		MachineName: require("os").hostname(), 
		Time: moment.utc().format(), 
		Controller: nodeModule, 
		Action: req.method,  
		MethodName: action, 
		Trace: trace, 
		FreeText: req.headers.host + req.url.path, 
		Guid: req.headers.Guid, 
	};
    this.redisDataSource.insertEvent(logEntry, msg, function(err, data){});
}

module.exports = NodejsLogger;
