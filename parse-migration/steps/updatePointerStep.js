/**
 * Created by Dell on 2/9/2016.
 */

var logger = require('../logging/logger').getLogger('updatePointer');
const BULK_SIZE = 1;

function updatePointer(){
    this.stepName = "updatePointer";
}

updatePointer.prototype.updateInner = function(className, bulkRunner, cb) {
    var current =this;
    // transform
    if(current.updateStatetmentBulk.length > 0) {
        var command = current.updateStatetmentBulk.join(";") + ";";

        bulkRunner.update(command, function (error) {
            // error report
            logger.error(command + ' ' + JSON.stringify(error))
            current.report.updatePointerError(className, error);
        }, function () {
            if (current.updateStatetmentBulk) {
                current.report.updatePointerSuccess(className, current.updateStatetmentBulk.length);
            }

            current.statusBl.setCurrentObjectId(current.appName, current.stepName, className, current.objectId);
            current.updateStatetmentBulk = [];
            cb();
        });
    }
    else{
        cb();
    }
}

updatePointer.prototype.updatePointers = function(objectId, appName, statusBl, streamer, report, datalink, fileName, converter, className, bulkRunner, callback) {

    var current =this;
    current.report = report;
    current.updateStatetmentBulk = [];
    current.filename = fileName;
    current.finishCallback = callback;
    current.firstObjectId = objectId;
    current.statusBl = statusBl;
    current.appName = appName;

    function onFinish() {
        logger.info('updatePointerOnFinish for ' + current.filename)
        current.updateInner(className, bulkRunner, function () {
            logger.info('finish updatePointers for ' + current.filename);
            current.finishCallback();
        })
    }

    function onData(data, cb) {
        var json = data;

        // keep objectId as static to have it in finishFunction
        current.objectId = data.objectId;

        var sqlArray = converter.getUpdateStatementsForAllPointer(className, json, function (error) {
            logger.error('getUpdateStatementsForAllPointer for ' + className);

        })
        if (!sqlArray || sqlArray.length == 0) {
            cb();
            return;
        }

        current.updateStatetmentBulk.push(sqlArray.join(";"));
        if (current.updateStatetmentBulk.length === BULK_SIZE) {
            current.updateInner(className, bulkRunner, cb);
        } else{
            cb();
        }
    }


    if (current.objectId) {
        streamer.getDataFromSpecificObjectId(datalink, fileName, current.objectId, onData, onFinish);
    }
    else {
        streamer.getData(datalink, fileName, onData, onFinish);
    }


};


module.exports = updatePointer;