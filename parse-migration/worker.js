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
var workerId = globalConfig.workerId;


function mainRoutine() {
    statusBl.connect().then(statusBl.getNextJob).then(function (job) {
        if (job) {
            logger.info('start job for app ' + job.appName)

            var jobStatus = job.status;
            if (jobStatus == 0) {
                statusBl.takeJob(job);
            }

            fileUtil.downloadFile(job.parseUrl, job.appName).then(function (filePath) {
                logger.info('start unzip for app ' + job.appName)

                fileUtil.unzipFile(filePath, job.appName).then(function (directory) {
                    logger.info('start schema transformation');
                    //add schema
                    var objects = [];
                    var t = transformer(JSON.parse(job.parseSchema));
                    _.each(t, function (s) {
                        //console.log(s);
                        objects.push(s);
                    });

                    // call to backand model
                    statusBl.model(objects, job.appToken).then(function (model) {

                        //get files
                        var files = fileUtil.getFilesList(directory);

                        statusBl.fillSchemaTable(job.appName, jobStatus, files).then(function () {

                            logger.info('start migration for app ' + job.appName);
                            //add all the files into the app table
                            directory = directory + "/";
                            migrator.run(job, directory, statusBl, function () {
                                statusBl.finishJob(job).then(function () {
                                    logger.info('job finish ' + job.appName);
                                    mainRoutine();
                                });
                            });
                        })
                    });

                }, logError);
            }, logError);
        } else {
            setTimeout(mainRoutine, waitInterval);
        }
    });


}

function logError(err) {
    logger.error(err);
}


mainRoutine();


