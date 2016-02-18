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
var RedisBulk = require('./redisBulkStatus');
var redisFileStatus = new RedisBulk();

var self = this;

function StatusBl(workerId) {
    self.workerId = workerId;
    logger.info('start statusBl with workerId ' + workerId);
}


StatusBl.prototype.connect = function () {
    var deferred = q.defer();
    logger.info('login with ' + config.username + ' to app ' + config.appName);
     backand.auth({username: config.username, password: config.passworsd, appname: config.appName})
        .then(function () {
            logger.info("success connect to Backand");
            deferred.resolve();
        }).fail(function(err){
             deferred.reject(err);
         });

    return deferred.promise;
}

StatusBl.prototype.getNextJob = function () {
    logger.info('start get next Job');
    var data = {'workerId': self.workerId};
    var deferred = q.defer();
    function getEqualityFilter() {
        return {fieldName: "workerId", operator: "equals", value: self.workerId};
    }

    backand.get('/1/query/data/getNextJob', data)
        .then(function (result) {
            if (!result) {
                deferred.resolve(undefined);
                return;
            }

            logger.info('found ' + result.length + ' jobs');

            if (result.length === 0) {
                deferred.resolve(undefined);
                return;
            }

            if (result[0].id) {
                deferred.resolve(result[0]);
                return;
            }

        })
        .fail(function(err){
            deferred.reject(err);
        });

    return deferred.promise;
};

StatusBl.prototype.finishJob = function (job) {
    job.status = 2;
    job.FinishTime = new Date();
    return backand.put('/1/objects/MigrationJobQueue/' + job.id, job);
}

StatusBl.prototype.takeJob = function (job) {
    // update job taken
    var deferred = q.defer();
    logger.info("try take job for app " + job.appName + ' and jobId ' + job.id);
    job.status = 1;
    job.workerId = this.workerId;
    job.attempts = job.attempts + 1;

    backand.put('/1/objects/MigrationJobQueue/' + job.id + '?returnObject=true', job)
        .then(function (res) {
            logger.info('success take job ' + job.id);
            deferred.resolve(job);
        }).fail(function(err) {
            deferred.reject(err);
        })

    return deferred.promise;

}

StatusBl.prototype.fillSchemaTable = function (appName, status, tables) {
    var deferred = q.defer();

    if (status == 1) {
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
            })
    }, function done() {
        deferred.resolve();
    });

    return deferred.promise;


}

StatusBl.prototype.setTableFinish = function (appName, tableName) {
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
                })

        })

    return deferred.promise;
}

StatusBl.prototype.model = function (schema, token) {

    logger.info('start post the new model ');

    var deferred = q.defer();

    var backandClient = new BackandSDK(globalConfig.api_url);

    var data = {"newSchema": schema, "severity": 0};

    backandClient.basicAuth(token).then(function () {
        backandClient.post('/1/model', data).then(function () {
            logger.info('end post the new model');
            deferred.resolve();
        }).fail(function(err){
            deferred.reject(err);
        })
    },
    function(err){
        logger.error('error post the new model: ' + JSON.stringify(err));
    });

    return deferred.promise;

}

StatusBl.prototype.setCurrentObjectId = function (appName, file, objectId) {
    // go to redis set
    return redisFileStatus.setStatus(appName, file, objectId);
}

StatusBl.prototype.getCurrentObjectId = function (appName) {
    return redisFileStatus.getStatus(appName);
}

StatusBl.prototype.cleanup = function () {
    return backand.get('/1/query/data/cleanup')

}

StatusBl.prototype.enqueueSimpleJob = function () {
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

    return backand.post('/1/objects/MigrationJobQueue', data)
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