/**
 * Created by backand on 3/27/16.
 */

var logEntry = 'log_api';

var redis = require('redis'),
    RedisStore = require('socket.io-redis');
 var async = require('async');
 var _ = require('lodash');

var redisConfig = require('../../configFactory').getConfig().redis;

var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = redisConfig.option;

var redis = require('redis');
var redis_scanner = require('redis-scanner');

var scanCallbacks = {};

function RedisDataSource() {

    var current = this;
    this.readyToRead = false;
    this.redisInterface = redis.createClient(redisPort, redisHostname, option);

    var optionsScanner = {
        onData: function(result){
            scanCallbacks.onData(result);

        },
        onEnd: function(err){
            scanCallbacks.onEnd(err);
        }
    };
    this.scanner = new redis_scanner.Scanner(this.redisInterface, 'SCAN', null, optionsScanner);

    this.redisInterface.on('connect', function () {
        current.readyToRead = true;
        console.log('connected to redis');
    });
    this.redisInterface.on('reconnecting', function () {
        current.readyToRead = false;
        console.log('reconnecting to redis');
    });
    this.redisInterface.on('end', function () {
        current.readyToRead = false;
        console.log('redis connection closed');
    });
    this.redisInterface.on('error', function (err) {
        console.log('error', err);
        //this.readyToRead = true;
    });

}


RedisDataSource.prototype.getEvent = function (cb) {
   
    var current = this;
    async.during(
        function (callback) {     
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {
            if (!err){

                current.redisInterface.lpop(logEntry, function (err, data) {
					var entry = {origin: data, parsed: JSON.parse(data)};
                       cb(err, entry);
                });

            }
            else{
                cb(err);
            }
        }
    );
    
};

RedisDataSource.prototype.addEventToSortedSet = function (key, score, message, cb) {

    var current = this;

    async.during(
        function (callback) {
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {

            if (!err){

                var fMessage = JSON.stringify(message);

                current.redisInterface.zadd([key, score, fMessage], function (err, data) {
                    cb(err, data);
                });
            }
            else{
                cb(err);
            }
        }
    );

}

RedisDataSource.prototype.filterSortedSet = function (key, fromScore, toScore, offset, count, cb) {
    var current = this;

    async.during(
        function (callback) {
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {

            if (!err){     
                current.redisInterface.zrangebyscore(key, fromScore, toScore, 'WITHSCORES', 'LIMIT', offset, count, function (err, data) {
                    cb(err, 
                        _.filter(
                                interleavedValueAndKeyArray, 
                                function(value, index){
                                    return index % 2 == 0;
                                }
                        )
                    );
                });
            }
            else{
                cb(err);
            }
        }
    );

}

RedisDataSource.prototype.scan = function (onData, onEnd) {
    
    var current = this;

    async.during(
        function (callback) {
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {

            if (!err){   

                scanCallbacks = {
                    onData: onData,
                    onEnd: onEnd
                }
                current.scanner.start();
                
            }
            else{
                onEnc(err);
            }
        }
    );

}

RedisDataSource.prototype.expireSortedSet = function (key, topScore, cb) {
    var current = this;

    async.during(
        function (callback) {
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {

            if (!err){     
                current.redisInterface.zremrangebyscore(key, 0, topScore, function (err, data) {
                    cb(err, data);
                });
            }
            else{
                cb(err);
            }
        }
    );

}

RedisDataSource.prototype.expireElementsOfSets = function (deltaMilliseconds) {
    var current = this;

    async.during(
        function(callback) { 
            return callback(null, !current.readyToRead);
        },
        function(callback) {

            redisDataSource.scan(

                function(data){
                    var topScore = (new Date()).getTime() - deltaMilliseconds;
                    current.expireSortedSet(key, topScore, cb);
                }, 

                function(err){
                    
                }
            );
        },
        function (err) {
            console.log(err);
        }
    );
}


RedisDataSource.prototype.insertEvent = function (key, message, cb) {

    var current = this;

    async.during(
        function (callback) {
            return callback(null, !current.readyToRead);
        },
        function (callback) {
            setTimeout(callback, 1000);
        },
        function (err) {

            if (!err){

                var fMessage = JSON.stringify(message);

                current.redisInterface.lpush(key, fMessage, function (err, data) {
                    cb(err, data);
                });
            }
            else{
                cb(err);
            }
        }
    );

}

RedisDataSource.prototype.delWildcard = function(key, callback) {
    
    var current = this;
 
    current.redisInterface.keys(key, function(err, rows) {
        async.each(rows, function(row, callbackDelete) {
            current.redisInterface.del(row, callbackDelete)
        }, callback)
    });

}

module.exports = RedisDataSource;
