var mysql = require('mysql');

var _ = require('lodash');
var async = require('async');

var connectionInfo = {
	"multipleStatements": true,
	host: 'localhost',
	port: 3306,
	database: 'test',
	user: 'root',
	password: 'root'
};

var sqlArray = [
  "INSERT INTO r1(name, flag) VALUES('fifth', 1)", 
  "INSERT INTO r1(id, name, flag) VALUES(1, 'onefirst', 0)",
  "INSERT INTO r1(name, flag) VALUES('second', 1)",
  "INSERT INTO r1(name, flag) VALUES('nine', 0)"
];

bulkInsert(sqlArray, connectionInfo, 
  function(e){
    console.log("errorCallback");
    console.log(JSON.stringify(e));
    process.exit(1);
  }, 
  function(){
    console.log("successCallback");
    process.exit(0);
  }
);

function bulkInsert(sqlArray, connectionInfo, errorCallback, successCallback){
  
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
        console.log(results);
        if (err) {
          console.log("err", err);
          errors.push({ index: countExecuted + results.length,  statement: statementsLeftArray[results.length], err: err });   
          countExecuted += results.length + 1; 
        }  
        else{
          countExecuted += results.length;
        }
        console.log("countExecuted", countExecuted);
        
        if (countExecuted == toBeExecuted){
          console.log('finished');
          callback(errors, countExecuted)
        }
        else{
          callback();
        }
      });
    }, 
    function(errors, count){
      console.log("end", errors, count);
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




  // connection.query(sql)
  //   .on('fields', function(fields, index) {
  //     // the fields for the result rows that follow 
  //     console.log('fields', fields, index);
  //   })
  //   .on('result', function(row, index) {
  //     // index refers to the statement this result belongs to (starts at 0) 
  //    console.log('result', row, index);
  //   })
  //   .on('error', function(err, a){
  //    console.log('error', err, a);
  //   });

}

