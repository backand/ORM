/**
 * Created by Dell on 2/2/2016.
 */
var mysql = require('mysql');

var self = this;

function BulkRunner(connectionInfo) {
    self.connectionInfo = connectionInfo;
}

BulkRunner.prototype = (function() {
    // Private code here

    return {

        constructor:BulkRunner,

        insert:function(sql, values, errorCallback) {
            var conn = mysql.createConnection(self.connectionInfo);

            conn.query(sql, [values], function(err) {
                if (err) {
                    errorCallback({
                        js: "BulkRunner",
                        func: "insert",
                        message: "Insert failed",
                        internalError: err
                    });
                };
                conn.end();
            });
        }

    };
})();

module.exports = BulkRunner;