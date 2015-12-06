/**
 * Created by backand on 11/22/15.
 */''

var async = require('async');
var _ = require('underscore');


function redisBl(redisInterface){
    return {
        createKey: function (appName) {
            return "|" + appName.toLowerCase();
        },

        getAllUsers: function (appName, callback) {
            redisInterface.lrange(this.createKey(appName), 0, -1, function (err, reply) {
                var object = [];

                // we have to serialize again all users
                _.each(reply, function (str) {
                    object.push(JSON.parse(str));
                });

                if (typeof(callback) === "function") {
                    callback(err, object);
                }

            });
        },

        getAllUsersByRole: function (appName, role, callback) {
            this.getAllUsers(appName, function (err, object) {
                var filtered = _.where(object, {"role": role});

                if (typeof(callback) == "function") {
                    callback(err, filtered);
                }
            })
        },

        getUserByList: function (appName, userList, callback) {
            this.getAllUsers(appName, function (err, object) {

                // create intersection between userList and users from store
                var filtered = _.filter(object, function (user) {
                    return _.contains(userList, user.username);
                });

                if (typeof(callback) == "function") {
                    callback(err, filtered);
                }
            })
        },

        removeSocket: function (id, callback) {
            var self = this;
            redisInterface.get(id, function (err, data) {
                if (err || data === null) {
                    return;
                }

                redisInterface.del(id);

                // value exist in redis
                var appName = data;

                self.getAllUsers(appName, function (err, list) {
                    var found = _.find(list, function (d) {
                        return d.socketId == id
                    });

                    // socket doesn't exist in app Set
                    if (found === undefined) {
                        return;
                    }

                    redisInterface.lrem(self.createKey(appName), -1, JSON.stringify(found), function (err, data) {
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

            redisInterface.set(socketId, appName);
            redisInterface.rpush([this.createKey(appName), JSON.stringify(user)], callback);
        },

        login: function (socket, appName, username, role) {
            this.saveUser(appName, socket.id, username, role);
            socket.join(appName);
            socket.room = appName;
            socket.emit("authorized");
            console.log("authorized");
        },

        cleanUp: function (callback) {
            redisInterface.keys("*", function (err, keys) {

                var ind = keys.length;

                _.each(keys, function(k){
                    redisInterface.del(k);
                    ind--;
                });


                // block everything!
                while(ind > 0){

                }

                if (typeof (callback) == 'function') {
                    console.log('done');
                    callback();
                }

            });
        },
        self: this
    };
};

module.exports.BusinessLogic = redisBl;
