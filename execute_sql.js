module.exports.executer = executeSQL;

var mysql      = require('mysql');
var transformer = require('./transform').transformer;

function executeSQL(hostname, port, db, username, password, statementsArray, callback){

	var connection = mysql.createConnection({
	  host     : hostname,
	  database: db,
	  user     : username,
	  password : password,
	  port: port,
	  multipleStatements: true
	});

	var statements = statementsArray.join(";") + ";";
	 
	connection.connect(function(err) {
		
		if (err) {
		    console.error('error connecting: ' + err.stack);
		    terminate(connection, err, null, callback);
		}
	 
	    console.log('connected as id ' + connection.threadId);

		connection.beginTransaction(function(err) {
		  	connection.query(statements, function(err, result) {
			    if (err) { 
			      connection.rollback(function() {
			        terminate(connection, err, null, callback);
			      });
			    }
			    else{
			    	connection.commit(function(err) {
				        if (err) { 
				          connection.rollback(function() {
				            terminate(connection, err);
				          });
				        }
				        console.log('success!');
				        terminate(connection, null, result, callback);
				    });
			    }
			});



		});
		 
	    

	});
}

function terminate(connection, err, result, callback){
	connection.end(function(err) {
	  // The connection is terminated now 
	  if (err){
	  	console.log(err);
	  }
	  callback(err, result);
	});
}
 
// testExecuteMySQL();

function testExecuteMySQL(){
	var r = transformer([], 
		[
			{
				"name": "R",
				"fields": {
					"A": {
						"type": "string",
						"required": true
					},

					"B": {
						"type": "float"
					}
				}
			},

			{
				"name": "S",
				"fields": {
					"D": {
						"type": "boolean"
					},

					"E": {
						"type": "float"
					}
				}
			},

			{
				"name": "U",
				"fields": {
					"F": {
						"type": "binary"
					},

					"D": {
						"type": "text"
					}
				}
			},
		], 
	0);
	console.log(r);
	// executeSQL("bk-prod-us1.cd2junihlkms.us-east-1.rds.amazonaws.com", 3306, "backandtestsqlxzhsfvrb", "lmlmez3renpyl4j", "S12nZ1bx5W3MncYAiciy6s", r.alter, function(err, result){
	// 	console.log(err);
	// 	console.log(result);
	// });

}
