/**
 * Created by backand on 11/22/15.
 */''

var async = require('async');
var _ = require('underscore');
var config = require('../configFactory').getConfig();
var logger = require('../logging/logger').getLogger("socketio_" + config.env);


function redisBl(redisInterface){
    return {
        createKey: function (appName) {
            return "|" + appName.toLowerCase();
        },

        getAllUsers: function (appName, callback) {
            redisInterface.lrange(this.createKey(appName), 0, -1, function (err, reply) {
                var object = [];

                if (err){
                    logger.debug('getAllUsers lrange err:' + JSON.stringify(err));
                }

                // we have to serialize again all users
                if (!err){
                   _.each(reply, function (str) {
                        object.push(JSON.parse(str));
                    });                 
                }


                if (typeof(callback) === "function") {
                    callback(err, object);
                }

            });
        },

        getAllUsersByRole: function (appName, role, callback) {
            this.getAllUsers(appName, function (err, object) {
                var filtered = null;
                if (!err){
                    filtered = _.where(object, {"role": role});
                }
                else{
                    logger.debug('getAllUsersByRole err:' + JSON.stringify(err));
                }

                if (typeof(callback) == "function") {
                    callback(err, filtered);
                }
            })
        },

        getUserByList: function (appName, userList, callback) {
            this.getAllUsers(appName, function (err, object) {
                var filtered = null;
                // create intersection between userList and users from store
                if (!err){
                    var filtered = _.filter(object, function (user) {
                        return _.contains(userList, user.username);
                    });                    
                }
                else{
                  logger.debug('getUserByList err:' + JSON.stringify(err));  
                }

                if (typeof(callback) == "function") {
                    callback(err, filtered);
                }
            })
        },

        removeSocket: function (id, callback) {
            var self = this;
            redisInterface.get(id, function (err, data) {
                if (err){
                    logger.debug('removeSocket err:' + JSON.stringify(err));
                }
                if (err || data === null) {
                    return;
                }

                redisInterface.del(id,  function(err, reply) {
                    logger.debug('removeSocket del:' + JSON.stringify(err));
                });


                // value exist in redis
                var appName = data;

                self.getAllUsers(appName, function (err, list) {
                    if (err){
                        logger.debug('removeSocket getAllUsers:' + JSON.stringify(err));
                        return;
                    }
                    var found = _.find(list, function (d) {
                        return d.socketId == id
                    });

                    // socket doesn't exist in app Set
                    if (found === undefined) {
                        return;
                    }

                    redisInterface.lrem(self.createKey(appName), -1, JSON.stringify(found), function (err, data) {
                        if (err){
                            logger.debug('lrem err:' + JSON.stringify(err));
                        }
                        if (typeof(callback) == "function") {
                            callback(err, data);
                        }
                    });
                });

            });

        },

        saveUser: function (appName, socketId, username, role, callback) {
            var user = {
                socketId: socketId,
                username: username,
                role: role,
            };
            var that = this;
            redisInterface.set(socketId, appName, function (err, reply) {
                if (err){
                    logger.debug('saveUser set err:' + JSON.stringify(err));
                    callback(err);
                }
                else{
                    redisInterface.rpush([that.createKey(appName), JSON.stringify(user)], function(err) {
                        if (err){
                            logger.debug('saveUser rpush err:' + JSON.stringify(err));
                            callback(err);
                        } 
                        callback(null);
                    });
                }
            });

        },

        login: function (socket, appName, username, role) {
            this.saveUser(appName, socket.id, username, role, function(err){
                logger.debug(err);
                if (!err){
                    socket.join(appName);
                    socket.room = appName;
                    socket.emit("authorized");
                    logger.debug("authorized"); 
                }
            });
        },

        cleanUp: function (callback) {
            redisInterface.keys("*", function (err, keys) {

                if (!err){
                    var ind = keys.length;

                    _.each(keys, function(k){
                        redisInterface.del(k, function(err){
                            if (err){
                                logger.debug(err);
                            }
                        });
                        ind--;
                    });


                    // block everything!
                    while(ind > 0){

                    }                   
                }
                else{
                    logger.debug('cleanUp keys err:' + JSON.stringify(err));
                }


                if (typeof (callback) == 'function') {
                    logger.debug('done');
                    callback();
                }

            });
        },
        self: this
    };
};

module.exports.BusinessLogic = redisBl;
