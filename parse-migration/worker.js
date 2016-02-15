/**
 * Created by backand on 2/8/16.
 */
var _ = require('lodash');
var StatusBl = require('./StatusBL');
var Migrator = require('./Migrator');
var migrator = new Migrator();
var statusBl = new StatusBl(workerId);
var waitInterval = 5 * 1000;
var logger = require('./logging/logger').getLogger('worker');
var FileDownloader = require('./fileDownloader');
var fileUtil = new FileDownloader('./files_download');
var transformer = require('../parse-to-json-transformation/parse_transform').transformer;
var globalConfig = require('./configFactory').getConfig();
var q = require('q');
var workerId = globalConfig.workerId;
q.longStackSupport = true;


function mainRoutine() {
    var self = this;

    function takeJob(job){
        self.job = job;
        var deferred = q.defer();
        if (job) {
            logger.info('start job for app ' + job.appName)

            self.jobStatus = job.status;
            if (self.jobStatus == 0) {
                statusBl.takeJob(job).then(function(){
                    deferred.resolve(job);
                });
            }
        }
        else{
          //  setTimeout(mainRoutine, waitInterval);
            deferred.reject({'msg' : "no job in queue"});
        }

        return deferred.promise;
    }

    function downloadFile(){
        return fileUtil.downloadFile(self.job.parseUrl, self.job.appName);
    }

    function unzipFile(filePath){
        logger.info('start unzip for app ' + self.job.appName);
        return fileUtil.unzipFile(filePath, self.job.appName).then(function(directory){
            self.directory = directory;
        })
    }

    function schemaTransformation(){
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

    function fillSchemaTable() {
        var files = fileUtil.getFilesList(self.directory);
        return statusBl.fillSchemaTable(self.job.appName, self.jobStatus, files)
    }

    function migrateData(){
        var deferred = q.defer();
        logger.info('start migration for app ' + self.job.appName);
        //add all the files into the app table
        self.directory = self.directory + "/";
        migrator.run(self.job, self.directory, statusBl,  deferred.makeNodeResolver());
        return deferred.promise;

    }

    function setJobFinish(){
        logger.info('job finish ' + self.job.appName);
        return statusBl.finishJob(self.job);
    }

    function startAgain(){
        setTimeout(mainRoutine, waitInterval);
    }

    statusBl.connect()
        .then(statusBl.getNextJob)
        .then(takeJob)
        .then(downloadFile)
        .then(unzipFile)
        .then(schemaTransformation)
        .then(migrateData)
        .then(setJobFinish)
        .fail(logError)
        .done(startAgain);
}

function logError(err) {
    logger.error(err);
}


mainRoutine();


