/**
 * Created by backand on 2/4/16.
 */
var logger = require('./logging/logger').getLogger('statusBLMock');
var globalConfig = require('./configFactory').getConfig();
var config = globalConfig.authDetail;
var BackandSDK = require('backandsdk/backand');
var backand = new BackandSDK(globalConfig.api_url);
var async = require('async');
var q = require('q');
var RedisBulk = require('./redisBulkStatus');
var redisFileStatus = new RedisBulk();
var StatusBl = require('./statusBl');
var realStatusBl = new StatusBl('test');

var self = this;
var StatusBlMock = function (job, workerId) {
    self.job = job;
    self.workerId = workerId;
};

StatusBlMock.prototype.connect = function () {
    return realStatusBl.connect();
}

StatusBlMock.prototype.getNextJob = function () {
    logger.info('start get next Job');
    var data = {'workerId': self.workerId};
    return q(self.job);
};

StatusBlMock.prototype.finishJob = function (job) {
    self.job.status = 2;
    self.job.FinishTime = new Date();
    return q(undefined);
}

StatusBlMock.prototype.takeJob = function (job) {
    // update job taken
    logger.info("try take job for app " + job.appName + ' and jobId ' + job.id);
    self.job.status = 1;
    self.job.workerId = this.workerId;
    return q(undefined);
}

StatusBlMock.prototype.fillSchemaTable = function (appName, status, tables) {
    return realStatusBl.fillSchemaTable(appName, status, tables);
}

StatusBlMock.prototype.setTableFinish = function (appName, tableName) {
    return realStatusBl.setTableFinish(appName, tableName);

}

StatusBlMock.prototype.model = function (schema, token) {
    realStatusBl.model(schema, token);
}

StatusBlMock.prototype.setCurrentObjectId = function (appName, file, objectId) {
    // go to redis set
    return redisFileStatus.setStatus(appName, file, objectId);
}

StatusBlMock.prototype.getCurrentObjectId = function (appName) {
    return redisFileStatus.getStatus(appName);
}

StatusBlMock.prototype.cleanup = function () {
    return backand.get('/1/query/data/cleanup')

}

StatusBlMock.prototype.getJob = function () {
    return self.job;
}

StatusBlMock.prototype.enqueueSimpleJob = function () {
    var data = {
        appName: 'qaparse1',
        parseUrl: 'https://s3.amazonaws.com/files.backand.io/parseconverter/e41158a4-03cd-476e-b998-9adc784bfabd_1454941883_export.zip',
        appToken: 'appToken',
        status: 0,
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

module.exports = StatusBlMock;