/**
 * Created by Dell on 2/9/2016.
 */
var logger = require('../logging/logger').getLogger('insertClass');
const BULK_SIZE = 1;


//                var insertStep = new InsertClassStep(statusBl, bulkRunner, classJsonConverter, streamer);

function insertClass(appName, statusBl, bulkRunner, classJsonConverter, streamer, report){
    this.appName= appName;
    this.statusBl = statusBl;
    this.bulkRunner = bulkRunner;
    this.converter = classJsonConverter;
    this.streamer = streamer;
    this.report = report;
}


insertClass.prototype.insertClassInsertToDB = function(className, sql, cb) {
// check bulk size arrive to size, if true => send to db
    var current = this;
    logger.info('bulkRunner insert ' + sql);
    current.bulkRunner.insert(sql, current.valuesForBulkInserts, function (error) {
        logger.error('bulkRunner error ' + sql);
        current.report.insertClassError(className, error);
    }, function () {
        logger.info('bulkRunner finish insert ' + sql);
        current.report.insertClassSuccess(className, current.valuesForBulkInserts.length);
        current.valuesForBulkInserts = [];
        cb();
    });
}


insertClass.prototype.insertClass = function( datalink, fileName, className, callback) {
    var current = this;
    function onInsertClassFinish(err) {
        if (err){
            current.report.insertClassError(className, err);
        }
        function updateTableStatus() {
            current.statusBl.setTableFinish(current.appName, fileName)
                .fail(function (error) {
                    logger.error("can't update " + filename + ' ' + error);

                }).fin(function(){
                    callback();
                })
        }

        if (current.valuesForBulkInserts && current.valuesForBulkInserts.length > 0) {
            insertClassInsertToDB(className, current.sql, function () {
                logger.info('finsih getData ' + fileName);
                updateTableStatus();
            });
        }
        else {
            logger.info('finsih getData else' + fileName);
            updateTableStatus();
        }
    };

    function onInsertClassData(data, cb) {
        if (!data) {
            cb();
        }
        else {
            // read each Parse class and insert it into a table
            var json = data;
            var valuesToInsert = current.converter.getValuesToInsertStatement(className, json, function (error) {
                // error report
            })

            current.valuesForBulkInserts.push(valuesToInsert);
            if (current.valuesForBulkInserts.length === BULK_SIZE) {
                console.log('send data to bulk');
                current.insertClassInsertToDB(className, current.sql, cb);
            }
            else {
                cb();
            }
        }
    };

    logger.info('start insert class ' + className);
    logger.info('start getData ' + fileName);
    current.valuesForBulkInserts = [];
    current.sql = current.converter.getInsertStatement(className, function (error) {
        // error report
    })

    current.streamer.getData(datalink, fileName, onInsertClassData, onInsertClassFinish)
};



module.exports = insertClass;