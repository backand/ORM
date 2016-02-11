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
            var connection = mysql.createConnection(self.connectionInfo);
            connection.beginTransaction(function(err) {
                    if (err) { throw err; }
                connection.query(sql, [values], function(err) {
                    if (err) {
                        logger.error('error finish to insert ' + this.sql + "; " + this.values.join() + ";  error: " + err.message);

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


                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                throw err;
                            });
                        }
                        logger.trace('success commit');
                        connection.end();

                        successCallback();

                    });
                });
            });
        },

        update:function(sql, errorCallback, successCallback) {
            logger.trace('start update ' + sql);
            var connection = mysql.createConnection(self.connectionInfo);

            connection.beginTransaction(function(err) {
                if (err) {
                    logger.error(this.sql + " " + err)
                    throw err; }

                connection.query(sql, function(err) {
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
                        logger.trace('success finish to update ' + this.sql);
                    }

                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                throw err;
                            });
                        }
                        logger.trace('Transaction Complete. ' + this.sql);
                        connection.end();
                        successCallback();

                    });
                });
            });
        }

    };
})();

module.exports = BulkRunner;