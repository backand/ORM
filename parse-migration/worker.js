/**
 * Created by backand on 2/8/16.
 */
var StatusBl = require('./StatusBL');
var Migrator = require('./Migrator');
var migrator = new Migrator();
var workerId = 1;
var statusBl = new StatusBl(workerId);
var waitInterval = 5 * 1000;
var logger = require('./logging/logger').getLogger('worker');
var FileDownloader = require('./fileDownloader');
var fileUtil = new FileDownloader();

function mainRoutine() {
    var job = statusBl.getNextJob();

    if (job) {
        logger.info('start job for app ' + job.appName)

        fileUtil.downloadFile(job.parseUrl, job.appName)
            .then(function (filePath) {
                fileUtil.unzipFile(filePath).then(function (directory) {
                    migrator.run(job.appName, job.appToken, undefined, job.parseSchema, directory, function () {
                        logger.info('job finish ' + job.appName);
                        mainRoutine();
                    });
                });
            });
    } else {
        setTimeout(mainRoutine, waitInterval);
    }

}

