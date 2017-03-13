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
                        _.map(
                            _.filter(
                                data, 
                                function(value, index){
                                    return index % 2 == 0;
                                }
                            ),
                            function(a){ 
                                return JSON.parse(a); 
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
                onEnd(err);
            }
        }
    );

}

RedisDataSource.prototype.appWithLoggingPlan = function(appName, cb) {
  cb(null, false);
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
                async.waterfall([
                    function(callbackWaterfall) {
                        redisDataSource.appWithLoggingPlan(appName, callbackWaterfall);
                    },
                    function(flag, callbackWaterfall) {
                        if (flag){
                            current.redisInterface.zrangebyscore(key, 0, topScore, function (err, data) {
                                current.redisInterface.zremrangebyscore(key, 0, topScore, function (err, dumpData) {
                                    callbackWaterfall(err, flag, data);
                                });
                            });
                        }
                        else{
                            current.redisInterface.zremrangebyscore(key, 0, topScore, function (err, data) {
                                callbackWaterfall(err, flag, null);
                            });
                        }
                    },
                    function(flag, data, callbackWaterfall) {
                        if (!flag) {
                            callbackWaterfall(null);
                        }
                        else if (!data){
                            callbackWaterfall(null);
                        }
                        else {
                            // send somewhere
                            callbackWaterfall(null);
                        }
                    }
                ], function(err, result){
                    cb(err, result);
                });


            }
            else{
                cb(err);
            }
        }
    );

}

RedisDataSource.prototype.expireElementsOfSets = function (deltaMilliseconds, cb) {
    var current = this;

    async.during(
        function(callback) { 
            return callback(null, !current.readyToRead);
        },
        function(callback) {

            current.scan(

                function(data){
                    var topScore = (new Date()).getTime() - deltaMilliseconds;
                    current.expireSortedSet(data, topScore, function(err){
                       
                    });
                }, 

                function(err){
                   cb(err);
                }
            );
        },
        function (err) {
            cb(err);
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

// var r = new RedisDataSource();
// r.expireElementsOfSets(10, function(err){
//     console.log(err);
//     process.exit(1);
// })
