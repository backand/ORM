/**
 * Created by Dell on 2/2/2016.
 */

var BulkRunner = require('./../bulk-runner');
var async = require('async');

var self = this;

function Cleaner(connectionInfo) {
    self.connectionInfo = connectionInfo;
}

Cleaner.prototype = (function() {
    // Private code here

    return {

        constructor:Cleaner,

        clean:function(parseSchema, errorCallback, successCallback, afterAllCompletedCallback) {
            var bulkRunner = new BulkRunner(self.connectionInfo);
            async.eachSeries(parseSchema,
                function(parseClass, successCallback){
                    var sql = "SET FOREIGN_KEY_CHECKS = 0; truncate table " + parseClass.className + "; SET FOREIGN_KEY_CHECKS = 1;";
                    bulkRunner.update(sql, function (error) {
                        errorCallback(error);
                }, successCallback);
            },
                function() {
                    afterAllCompletedCallback();
                }
            );
        }

    };
})();

module.exports = Cleaner;