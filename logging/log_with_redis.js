var RedisDataSource = require('../logger-reply/sources/RedisDataSource');

function NodejsLogger(source) {
	this.source = source;
	this.redisDataSource = new RedisDataSource();
}

NodejsLogger.prototype.log = function (msg){
    this.redisDataSource.insertEvent(this.source, msg, function(err, data){});
}

module.exports = NodejsLogger;
