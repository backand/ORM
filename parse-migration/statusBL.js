/**
 * Created by backand on 2/4/16.
 */

var config = require('./config');
var backand = require('backandsdk/backand');
var logger = require('./logging/logger').getLogger('StatusBl');
var async = require('async');
var q = require('q');

var StatusBl = function (workerId) {
    this.workerId = workerId;
};

StatusBl.prototype.connect = function () {
    return backand.auth({username: config.username, password: config.passworsd, appname: config.appName})
        .then(function () {
            logger.info("success connect to Backand");
        });
}

StatusBl.prototype.getNextJob = function () {
    var self = this;
    var data = {'workerId': self.workerId};

    function getEqualityFilter() {
        return {fieldName: "workerId", operator: "equals", value: self.workerId};
    }

    return backand.get('/1/query/data/getNextJob', data)
        .then(function (result) {
            if (!result) {
                return undefined;
            }

            //logger.info(`found ${result.length} jobs`);

            if (result[0].id) {
                return result[0];
            }

        });
};

StatusBl.prototype.finishJob = function (job, cb) {

}

StatusBl.prototype.takeJob = function (job) {
    // update job taken
    logger.info("try take job for app " + job.appName + ' and jobId ' + job.id);
    job.status = 1;
    job.workerId = this.workerId;

    return backand.put('/1/objects/MigrationJobQueue/' + job.id + '?returnObject=true', job)
        .then(function (res) {
            logger.info('success take job' + job.id);
        })
}

StatusBl.prototype.fillSchemaTable = function (appName, tables) {
    var deferred = q.defer();

    async.eachSeries(tables, function iterator(tableName, callback) {
        logger.info('start fillTable for ' + tableName + ' in ' + appName);
        var data = {
            appName: appName,
            tableName: tableName,
            insertTime: new Date(),
            endTime: null,
            isFinish: false
        };

        backand.post('/1/objects/MigrationTablesApp?returnObject=true').then(function ()  {
            logger.info('finish fillTable for ' + tableName + ' in ' + appName);
            callback();
        })
    }, function done() {
        deferred.resolve();
    });

    return deferred.promise();


}

StatusBl.prototype.setTableFinish = function (appName, tableName) {
    logger.info('start setTableFinish for ' + tableName + ' in ' + appName);

    var deferred = q.defer();

    backand.get('/1/objects/MigrationTablesApp', {'appName' : appName, 'tableName' : tableName})
    .then(function(res){
        var current = res.data[0];
        var id = current.id;

        logger.trace('finish get step setTableFinish for ' + tableName + ' in ' + appName + ' id is '+  id  + ' res: ' + JSON.stringify(res));
        current.isFinish = true;
        current.endTime = new Date();

        backand.post('/1/objects/MigrationTablesApp/' + id, current)
        .then(function() {
            logger.info('finish setTableFinish for ' + tableName + ' in ' + appName);
            deferred.resolve();
        })

    })

    return deferred.promise();
}

StatusBl.prototype.setCurrentObjectId = function (file, objectId) {
    // go to redis set
}

StatusBl.prototype.getCurrentObjectId = function(workerId){

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