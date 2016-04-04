/**
 * Created by backand on 2/4/16.
 */
var logger = require('./logging/logger').getLogger('statusBL');
var globalConfig = require('./configFactory').getConfig();
var config = globalConfig.authDetail;
var BackandSDK = require('backandsdk/backand');
var backand = new BackandSDK(globalConfig.api_url);
var async = require('async');
var q = require('q');
q.longStackSupport = true;

var RedisBulk = require('./redisBulkStatus');
var redisFileStatus = new RedisBulk();
var UserTableCreator = require('./userTableCreator');

function StatusBl(workerId) {
    var self = this;
    self.workerId = workerId;
    logger.info('start statusBl with workerId ' + workerId);


    // functions
    self.getNextJob = function () {
        logger.info('start get next Job');
        var data = {'workerId': self.workerId};
        var deferred = q.defer();

        backand.get('/1/query/data/getNextJob', data)
            .then(function (result) {
                if (!result) {
                    deferred.resolve(undefined);
                    return;
                }

                var firstID = result.length > 0 ? result[0].id : " ";
                logger.info('found ' + result.length + ' jobs ' + firstID);

                if (result.length === 0) {
                    deferred.resolve(undefined);
                    return;
                }

                if (result[0].id) {
                    deferred.resolve(result[0]);
                }
            })
            .fail(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };

    self.connect = function () {
        var deferred = q.defer();
        logger.info('login with ' + config.username + ' to app ' + config.appName + ' url:' + globalConfig.api_url);
        backand.auth({username: config.username, password: config.passworsd, appname: config.appName})
            .then(function () {
                logger.info("success connect to Backand");
                deferred.resolve();
            }).fail(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    self.finishJob = function (job) {
        job.status = 2;
        job.FinishTime = new Date();
        return self.clearJobStatus(job.appName).then(function () {
            return backand.put('/1/objects/MigrationJobQueue/' + job.id, job);
        });
    };

    self.logErrorMessage = function (job, errorMessage) {
        return self.clearJobStatus(job.appName).then(function () {
            return backand.put('/1/objects/MigrationJobQueue/' + job.id, {errorMessage:errorMessage});
        });
    };

    self.takeJob = function (job) {
        // update job taken
        var deferred = q.defer();
        logger.info("try take job for app " + job.appName + ' and jobId ' + job.id);
        job.status = 1;
        job.workerId = self.workerId;
        job.attempts = job.attempts + 1;

        backand.put('/1/objects/MigrationJobQueue/' + job.id + '?returnObject=true', job)
            .then(function () {
                logger.info('success take job ' + job.id);
                deferred.resolve(job);
            }).fail(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;

    };

    self.fillSchemaTable = function (appName, status, tables) {
        var deferred = q.defer();

        if (status === 1) {
            deferred.resolve();
            return deferred.promise;
        }

        async.eachSeries(tables, function iterator(tableName, callback) {
            logger.info('start fillTable for ' + tableName + ' in ' + appName);
            var data = {
                appName: appName,
                tableName: tableName,
                insertTime: new Date(),
                endTime: null,
                isFinish: false
            };
            backand.post('/1/objects/MigrationTablesApp?returnObject=true', data)
                .then(function () {
                    logger.info('finish fillTable for ' + tableName + ' in ' + appName);
                    callback();
                });
        }, function done() {
            deferred.resolve();
        });

        return deferred.promise;


    };

    self.setTableFinish = function (appName, tableName) {
        logger.info('start setTableFinish for ' + tableName + ' in ' + appName);

        var deferred = q.defer();

        backand.get('/1/objects/MigrationTablesApp', undefined,
            [
                {
                    fieldName: 'appName',
                    operator: 'equals',
                    value: appName
                },
                {
                    fieldName: 'tableName',
                    operator: 'equals',
                    value: tableName
                }]
            )
            .then(function (res) {
                var current = res.data[0];

                if (!current) {
                    deferred.reject('can"t find intresting this in response: ' + JSON.stringify(res.data));
                    return;
                }
                var id = current.id;

                logger.trace('finish get step setTableFinish for ' + tableName + ' in ' + appName + ' id is ' + id + ' res: ' + JSON.stringify(res));
                current.isFinish = true;
                current.endTime = new Date();

                backand.put('/1/objects/MigrationTablesApp/' + id, current)
                    .then(function () {
                        logger.info('finish setTableFinish for ' + tableName + ' in ' + appName);
                        deferred.resolve();
                    });

            });

        return deferred.promise;
    };

    self.model = function (schema, token, char) {
        logger.info(char + ' start post the new model ');

        var deferred = q.defer();

        var backandClient = new BackandSDK(globalConfig.api_url);

        var data = {"newSchema": schema, "severity": 0};

           backandClient.basicAuth(token)
            .then(function() {return backandClient.post('/1/model', data)} )
            .then(function () {
                            logger.info(char + ' end post the new model');
                            deferred.resolve();
                        })
            .catch(function (err) {
                    logger.error(char + ' end post the new model with error ' + err);
                    deferred.reject(err);
            });

        return deferred.promise;

    };

    self.updatePkType = function (token, appName) {
        logger.info('start update pk type ');
        var deferred = q.defer();

        var backandClient = new BackandSDK(globalConfig.api_url);

        var data = {"PkType": "char(36)"};

        backandClient.basicAuth(token);

        backandClient.put('/admin/myApps/' + appName, data)
            .then(function () {
                    logger.info('end update pk type');
                    deferred.resolve();
                })

        return deferred.promise;
    };

    self.setCurrentObjectId = function (appName, statusName, file, objectId) {

        //logger.info("REDIS " + appName + " " + statusName + " " + file + " " + objectId)
        // go to redis set
        return redisFileStatus.setStatus(appName, statusName, file, objectId);
    };

    self.getCurrentJobStatus = function (appName) {
        return redisFileStatus.getStatus(appName);
    };

    self.clearJobStatus = function (appName) {
        return redisFileStatus.clearStatus(appName);
    };

    self.cleanup = function () {
        return backand.get('/1/query/data/cleanup');

    };

    self.enqueueSimpleJob = function () {
        var data = {
            appName: 'test',
            parseUrl: 'www.parse.com',
            appToken: 'appToken',
            status: '0',
            parseSchema: 'www.parseSchema.com',
            workerId: '',
            CreationDate: new Date(),
            FinishTime: null
        };
        return backand.post('/1/objects/MigrationJobQueue', data);
    };


    StatusBl.prototype.getCurrentJobStatus = function (appName) {
        return redisFileStatus.getStatus(appName);
    }


    self.restoreUserTable = function (token, callback) {
        var userTableCreator = new UserTableCreator(new BackandSDK(globalConfig.api_url), token);
        userTableCreator.restoreUserTable(callback);
    };

    self.getWorkerId = function () {
        return self.workerId;
    };

}


/*
 var a = new StatusBl(1);
 a.connect()
 .then(function () {
 var u = a.getNextJob()
 .then(function (job) {
 console.log(job);
 a.takeJob(job);


 });
 }
 );
 */

module.exports = StatusBl;