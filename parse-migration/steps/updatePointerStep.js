/**
 * Created by Dell on 2/9/2016.
 */

var logger = require('../logging/logger').getLogger('updatePointer');
const BULK_SIZE = 1;

function updatePointer(){

}

updatePointer.prototype.updateInner = function(bulkRunner, cb) {
    var current =this;
    // transform
    if(current.updateStatetmentBulk.length > 0) {
        var command = current.updateStatetmentBulk.join(";") + ";";

        bulkRunner.update(command, function (error) {
            // error report
            logger.error(command + ' ' + JSON.stringify(error));
        }, function () {
            current.updateStatetmentBulk = [];
            cb();
        });
    }
    else{
        cb();
    }
}

updatePointer.prototype.updatePointers = function(streamer, datalink, fileName, converter, className, bulkRunner, callback) {
    var current =this;
    current.updateStatetmentBulk = [];
    current.filename = fileName;
    function updatePointerOnFinish() {
        current.updateInner(bulkRunner, function () {
            logger.info('finish updatePointers for ' + current.filename);
            callback();
        })
    }

    function updatePointerOnData(data, cb) {
        var json = data;
        var sqlArray = converter.getUpdateStatementsForAllPointer(className, json, function (error) {
            // error report
        })
        if (!sqlArray || sqlArray.length == 0) {
            cb();
            return;
        }

        current.updateStatetmentBulk.push(sqlArray.join(";"));
        if (current.updateStatetmentBulk.length === BULK_SIZE) {
            current.updateInner(bulkRunner, cb);
        } else{
            cb();
        }
    }
    streamer.getData(datalink, fileName, updatePointerOnData, updatePointerOnFinish);

};


module.exports = updatePointer;