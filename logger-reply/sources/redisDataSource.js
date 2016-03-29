/**
 * Created by backand on 3/27/16.
 */

var logEntry = 'log_api';
var redisConfig = require('../../configFactory').getConfig().redis;

var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = redisConfig.option;

var redis = require('redis');


function RedisDataSource() {

    var current = this;
    this.redisInterface = redis.createClient(redisPort, redisHostname, option);
    this.redisInterface.on('connect', function () {
        current.readyToRead = true;
        console.log('connected to redis');
    });
    this.redisInterface.on('error', function () {
        //this.readyToRead = true;
    });


}


RedisDataSource.prototype.getEvent = function (cb) {
    //console.log("aaaa");

    if (!cb) {
        throw new Error("callback must be valid;");
    }

    if (!this.readyToRead) {
        console.log("not ready");

        cb(null);
        return;
    }


    this.redisInterface.lpop(logEntry, function (err, data) {
        //console.log("bbbb");

        if (err) {
            cb(err);
            return;
        }

        var entry = {origin: data, parsed: JSON.parse(data)};

        cb(err, entry);
    });
};


module.exports = RedisDataSource;
