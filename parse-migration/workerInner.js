/**
 * Created by backand on 2/8/16.
 */

var _ = require('lodash');
var StatusBl = require('./StatusBL');
var ParseSchema = require('./parse-schema');
var Migrator = require('./Migrator');
var migrator = new Migrator();
var globalConfig = require('./configFactory').getConfig();
var workerId = globalConfig.workerId;
var statusBl = new StatusBl(workerId);
var waitInterval = 120 * 1000;
var logger = require('./logging/logger').getLogger('worker');
var FileDownloader = require('./fileDownloader');
var fileUtil = new FileDownloader('./files_download');
var Report = require('./report');

var transformer = require('../parse-to-json-transformation/parse_transform').transformer;
var q = require('q');
q.longStackSupport = true;

var self;

function Worker(mockStatusBl) {
    self = this;
    statusBl = mockStatusBl || statusBl;
    self.statusBl = statusBl;


}
Worker.prototype.takeJob = function (job) {
    self.job = job;
    var deferred = q.defer();
    if (job) {
        logger.info('start job for app ' + job.appName)

        self.jobStatus = job.status;
        self.report = new Report("migration.html", job.appName);

        statusBl.takeJob(job).then(function () {
            // report errors and statistics

            deferred.resolve(job);

        })
    }
    else {
        //  setTimeout(mainRoutine, waitInterval);
        deferred.reject({'msg': "no job in queue"});
    }

    return deferred.promise;
}

Worker.prototype.downloadFile = function () {
    return fileUtil.downloadFile(self.job.parseUrl, self.job.appName);
}

Worker.prototype.unzipFile = function (filePath) {
    logger.info('start unzip for app ' + self.job.appName);
    return fileUtil.unzipFile(filePath, self.job.appName).then(function (directory) {
        self.directory = directory;
    })
}

Worker.prototype.schemaTransformation = function () {
    var deferred = q.defer();
    logger.info('start schema transformation');
    //add schema
    var objects = [];

    var schemaObj = JSON.parse(self.job.parseSchema);
    var parseSchema = new ParseSchema(schemaObj.results);
    parseSchema.adjustNames();

    self.report.pushData('transform', parseSchema.getAdjustedNames());
    var t = transformer(schemaObj);
    _.each(t, function (s) {
        //console.log(s);
        objects.push(s);
    });

    // call to backand model
    statusBl.model([], self.job.appToken).then(function(){
        statusBl.model(objects, self.job.appToken).then(function(){
            deferred.resolve();
        }).fail(function(err){
            deferred.reject(err);
        })
    }).fail(function(err){
        deferred.reject(err);
    })

    return deferred.promise;
}

Worker.prototype.fillSchemaTable = function () {
    logger.info('start fillSchemaTable');
    var files = fileUtil.getFilesList(self.directory);
    return statusBl.fillSchemaTable(self.job.appName, self.jobStatus, files);
}

Worker.prototype.migrateData = function () {
    var deferred = q.defer();
    logger.info('start migration for app ' + self.job.appName);
    //add all the files into the app table
    self.directory = self.directory + "/";
    migrator.run(self.job, self.directory, statusBl, self.report, deferred.makeNodeResolver());
    return deferred.promise;

}

Worker.prototype.setJobFinish = function () {
    logger.info('job finish ' + self.job.appName);
    return statusBl.finishJob(self.job);
}

Worker.prototype.startAgain = function () {
    // console.log('start again');
    setTimeout(self.run, waitInterval);
}

Worker.prototype.logError = function (err) {
    logger.error(err);
}

Worker.prototype.finish = function () {
    if (self.done) {
        self.done();
    } else {
        self.startAgain();
    }
}

Worker.prototype.run = function (done) {
    var self = new Worker();
    self.done = done;
    q.fcall(statusBl.connect)
        .then(statusBl.getNextJob)
        .then(self.takeJob)
        .then(self.downloadFile)
        .then(self.unzipFile)
        .then(self.fillSchemaTable)
        .then(self.schemaTransformation)
        .then(self.migrateData)
        .then(self.setJobFinish)
        .fail(self.logError)
        .then(self.finish);
}


module.exports.Worker = Worker;

