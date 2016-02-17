/**
 * Created by backand on 2/4/16.
 */

var logger = require('./logging/logger').getLogger('RedisBulk');
var q = require('q');
process.chdir(__dirname);
var path = process.env.TESTPATH || '../';
var redisConfig = require(path + 'configFactory').getConfig().redis;
var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = redisConfig.option;
var redis = require('redis');
var redisInterface = redis.createClient(redisPort, redisHostname, option);


var RedisFileStatus = function () {
    this.getKey = function (key) {
        return "BULK_" + key;
    }
}

RedisFileStatus.prototype.getStatus = function (appName) {
    var deferred = q.defer();
    redisInterface.get(this.getKey(appName), function (err, str) {
        logger.warn(err);
        var data = JSON.parse(str);
        deferred.resolve(data);
        return data;
    })

    return deferred.promise;
}

RedisFileStatus.prototype.setStatus = function (appName, fileName, objectId) {
    var deferred = q.defer();

    var str = JSON.stringify({'fileName': fileName, 'objectId': objectId });
    redisInterface.set(this.getKey(appName), str, function(err, reply){
        if(err){
            deferred.reject(err);
        }

        deferred.resolve();
    });

    return deferred.promise;
}


module.exports = RedisFileStatus;