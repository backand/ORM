/**
 * Created by Dell on 2/2/2016.
 */
var mysql = require('mysql');
var logger = require('./logging/logger').getLogger('BulkRunner');

var self = this;

function BulkRunner(connectionInfo) {
    self.connectionInfo = connectionInfo;
}

BulkRunner.prototype = (function() {
    // Private code here

    return {

        constructor:BulkRunner,

        insert:function(sql, values, errorCallback, successCallback) {
            logger.trace('enter to insert for ' + sql);
            var conn = mysql.createConnection(self.connectionInfo);

            conn.query(sql, [values], function(err) {
                conn.end();
                if (err) {
                    logger.error('error finish to insert ' + this.sql + ";  error: " + err.message);

                    errorCallback({
                        js: "BulkRunner",
                        func: "insert",
                        message: "Insert failed",
                        internalError: err
                    });
                }
                else {
                    logger.trace('success finish to insert');
                };

                successCallback();

            });
        },

        update:function(sql, errorCallback, successCallback) {
            var conn = mysql.createConnection(self.connectionInfo);

            conn.query(sql, function(err) {
                conn.end();
                if (err) {
                    logger.error('error finish to update ' + this.sql + ";  error: " + err.message);
                    errorCallback({
                        js: "BulkRunner",
                        func: "update",
                        message: "Update failed",
                        internalError: err
                    });
                }
                else {
                    logger.trace('success finish to update');
                }
                successCallback();
            });
        }

    };
})();

module.exports = BulkRunner;