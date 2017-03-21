var logEntry = 'log_api';

var moment = require('moment');

var RedisDataSource = require('../logger-reply/sources/redisDataSource');

function NodejsLogger(source) {
	this.source = source;
	this.redisDataSource = new RedisDataSource();
}

NodejsLogger.prototype.log = function (msg){
    this.redisDataSource.insertEvent(msg, function(err, data){});
}

NodejsLogger.prototype.logFields = function (
	isInternal, req, typeOfMessage, nodeModule, action, message, trace){
	var msg = {
		Source: "NodeJS",
		ID: req && req.headers ? req.headers.ID : null,
		LogType: (typeOfMessage == "exception" ? "1" : "3"), 
		ExceptionMessage: (typeOfMessage == "exception" ? message : ""),
		LogMessage: (typeOfMessage != "exception" ? message : ""),	
		ApplicationName: this.source, 
		Username: req && req.headers ? req.headers.username : null, 
		MachineName: require("os").hostname(), 
		Time: moment.utc().format(), 
		Controller: nodeModule, 
		Action: req ? req.method : null,  
		MethodName: action, 
		Trace: trace, 
		FreeText: req && req.headers ? req.headers.host + (req.url ? req.url.path : '') : null, 
		Guid: req && req.headers ? req.headers.Guid : null 
	};
    this.redisDataSource.insertEvent(logEntry, msg, function(err, data){});
}

module.exports = NodejsLogger;
