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
                        var message = "error in: " + this.sql + "; " + this.values.join();
                        logger.error('error finish to insert ' + message + ";  error: " + err.message);
                        errorCallback({
                            js: "BulkRunner",
                            func: "insert",
                            message: message,
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

        bulkInsert: function(sqlArray, connectionInfo, errorCallback, successCallback){
            logger.trace('enter to bulk insert for ' + sql);
            var connection = mysql.createConnection(connectionInfo);
            var countExecuted = 0;
            var toBeExecuted = sqlArray.length;
            var errors = [];
            async.until(
                function(){ 
                  var stopCondition = countExecuted == toBeExecuted; 
                  console.log(stopCondition);
                  return stopCondition;
                }, 
                function(callback){
                  var statementsLeftArray = _.takeRight(sqlArray, toBeExecuted - countExecuted);
                  var sql = statementsLeftArray.join(";") + ";";
                  connection.query(sql, function(err, results) {
                    
                    if (err) {
                        errors.push({ index: countExecuted + results.length,  statement: statementsLeftArray[results.length], err: err });   
                        countExecuted += results.length + 1;
                        var message = "error in: " + sqlArray[countExecuted] + "; ";
                        logger.error('error finish to insert ' + message + ";  error: " + err);
       
                    }  
                    else{
                      countExecuted += results.length;
                    }
                    
                    if (countExecuted == toBeExecuted){
                      callback(errors, countExecuted)
                    }
                    else{
                      callback();
                    }
                  });
                }, 
                function(errors, count){
                  connection.end();
                  if (errors.length > 0){
                    var message = "errors in: " + _.reduce(errors, function(str, e){
                      return str + "; " + e.index + " " + e.statement + " " + e.err;
                    }, "");
                    errorCallback({
                      js: "BulkRunner",
                      func: "insert",
                      message: message,
                      internalError: errors
                    });
                  }
                  else{
                    successCallback()
                  }
                }
            );

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
                        var message = "error in: " + this.sql;
                        logger.error('error finish to update ' + message + ";  error: " + err.message);
                        errorCallback({
                            js: "BulkRunner",
                            func: "update",
                            message: message,
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