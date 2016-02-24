/**
 * Created by Dell on 2/9/2016.
 */
var logger = require('../logging/logger').getLogger('insertClass');
const BULK_SIZE = 1;

function insertClass(firstObjectId, appName, statusBl, bulkRunner, classJsonConverter, streamer, report) {
    this.appName = appName;
    this.statusBl = statusBl;
    this.bulkRunner = bulkRunner;
    this.converter = classJsonConverter;
    this.streamer = streamer;
    this.report = report;
    this.firstObjectId = firstObjectId;
    this.stepName = "insertClass";
}

insertClass.prototype.insertClassInsertToDB = function (objectId, className, sql, cb) {
    // check bulk size arrive to size, if true => send to db
    var current = this;
    logger.info('bulkRunner insert ' + sql);
    current.bulkRunner.insert(sql, current.valuesForBulkInserts, function (error) { // error
        logger.error('bulkRunner error ' + sql);
        current.report.insertClassError(className, error);
    }, function () { // success
        logger.info('bulkRunner finish insert ' + sql);

        //appName, statusName, file, objectId
        current.statusBl.setCurrentObjectId(current.appName, current.stepName, className, objectId);
        current.report.insertClassSuccess(className, current.valuesForBulkInserts.length);
        current.valuesForBulkInserts = [];
        cb();
    });
}

insertClass.prototype.insertClass = function (datalink, fileName, className, callback) {
    var current = this;
    current.finishCallback = callback;

    function onFinish(err) {
        if (err) {
            current.report.insertClassError(className, err);
        }

        function updateTableStatus() {
            current.statusBl.setTableFinish(current.appName, fileName)
                .fail(function (error) {
                    logger.error("can't update " + filename + ' ' + error);

                }).fin(function () {
                current.finishCallback();
            })
        }

        if (current.valuesForBulkInserts && current.valuesForBulkInserts.length > 0) {
            current.insertClassInsertToDB(current.objectId, className, current.sql, function () {
                logger.info('finish getData ' + fileName);
                updateTableStatus();
            });
        }
        else {
            updateTableStatus();
        }
    }

    function onData(data, cb) {
        if (!data) {
            cb();
        }
        else {
            // read each Parse class and insert it into a table
            var json = data;

            // keep objectId as static to have it in finishFunction
            current.objectId = data.objectId;

            var valuesToInsert = current.converter.getValuesToInsertStatement(className, json, function (error) {
                // error report
            })

            current.valuesForBulkInserts.push(valuesToInsert);
            if (current.valuesForBulkInserts.length === BULK_SIZE) {
                current.insertClassInsertToDB(current.objectId, className, current.sql, cb);
            }
            else {
                cb();
            }
        }
    }

    logger.info('start insert class ' + className);
    logger.info('start getData ' + fileName);
    current.valuesForBulkInserts = [];
    current.sql = current.converter.getInsertStatement(className, function (error) {
        // error report
    })

    if (current.firstObjectId) {
        current.streamer.getDataFromSpecificObjectId(datalink, fileName, current.firstObjectId, onData, onFinish);
    }
    else {
        current.streamer.getData(datalink, fileName, onData, onFinish)
    }
};

module.exports = insertClass;