/**
 * Created by backand on 2/8/16.
 */

var _ = require('lodash');
var StatusBl = require('./StatusBL');
var Migrator = require('./Migrator');
var migrator = new Migrator();
var globalConfig = require('./configFactory').getConfig();
var workerId = globalConfig.workerId;
var statusBl = new StatusBl(workerId);
console.log(statusBl.workerId);
var waitInterval = 5 * 1000;
var logger = require('./logging/logger').getLogger('worker');
var FileDownloader = require('./fileDownloader');
var fileUtil = new FileDownloader('./files_download');
var transformer = require('../parse-to-json-transformation/parse_transform').transformer;
var q = require('q');
q.longStackSupport = true;

var self = this;

function Worker(mockStatusBl) {
    statusBl = mockStatusBl || statusBl;
    self.statusBl = statusBl;


}
Worker.prototype.takeJob = function(job) {
    self.job = job;
    var deferred = q.defer();
    if (job) {
        logger.info('start job for app ' + job.appName)

        self.jobStatus = job.status;
        if (self.jobStatus == 0) {
            statusBl.takeJob(job).then(function () {
                deferred.resolve(job);
            });
        }
    }
    else {
        //  setTimeout(mainRoutine, waitInterval);
        deferred.reject({'msg': "no job in queue"});
    }

    return deferred.promise;
}

Worker.prototype.downloadFile = function() {
    return fileUtil.downloadFile(self.job.parseUrl, self.job.appName);
}

Worker.prototype.unzipFile = function(filePath) {
    logger.info('start unzip for app ' + self.job.appName);
    return fileUtil.unzipFile(filePath, self.job.appName).then(function (directory) {
        self.directory = directory;
    })
}

Worker.prototype.schemaTransformation = function() {
    logger.info('start schema transformation');
    //add schema
    var objects = [];
    var t = transformer(JSON.parse(self.job.parseSchema));
    _.each(t, function (s) {
        //console.log(s);
        objects.push(s);
    });

    // call to backand model
    return statusBl.model(objects, self.job.appToken)
}

Worker.prototype.fillSchemaTable = function () {
    logger.info('start fillSchemaTable');
    var files = fileUtil.getFilesList(self.directory);
    return statusBl.fillSchemaTable(self.job.appName, self.jobStatus, files);
}

Worker.prototype.migrateData = function() {
    var deferred = q.defer();
    logger.info('start migration for app ' + self.job.appName);
    //add all the files into the app table
    self.directory = self.directory + "/";
    migrator.run(self.job, self.directory, statusBl, deferred.makeNodeResolver());
    return deferred.promise;

}

Worker.prototype.setJobFinish = function() {
    logger.info('job finish ' + self.job.appName);
    return statusBl.finishJob(self.job);
}

Worker.prototype.startAgain = function() {
    setTimeout(mainRoutine, waitInterval);
}

Worker.prototype.logError = function(err) {
    logger.error(err);
}

Worker.prototype.run = function (done) {
    var self = this;
    statusBl.connect()
        .then(statusBl.getNextJob)
        .then(self.takeJob)
        .then(self.downloadFile)
        .then(self.unzipFile)
        .then(self.fillSchemaTable)
        .then(self.schemaTransformation)
        .then(self.migrateData)
        .then(self.setJobFinish)
        .fail(self.logError)
        .done(done || self.startAgain);
}

module.exports.Worker = Worker;

