var mysql      = require('mysql');

function executeSQL(hostname, db, username, password, statementsArray, callback){

	var connection = mysql.createConnection({
	  host     : hostname,
	  database: db,
	  user     : username,
	  password : password,
	  multipleStatements: true
	});

	var statements = statementsArray.join(";") + ";";
	 
	connection.connect(function(err) {
		
		if (err) {
		    console.error('error connecting: ' + err.stack);
		    terminate(err, null, callback);
		}
	 
	    console.log('connected as id ' + connection.threadId);

		connection.beginTransaction(function(err) {
		  	connection.query(statements, function(err, result) {
			    if (err) { 
			      connection.rollback(function() {
			        terminate(err, null, callback);
			      });
			    }
			    else{
			    	connection.commit(function(err) {
				        if (err) { 
				          connection.rollback(function() {
				            terminate(err);
				          });
				        }
				        console.log('success!');
				        terminate(null, result, callback);
				    });
			    }
			});



		});
		 
	    

	});
}

function terminate(err, result, callback){
	connection.end(function(err) {
	  // The connection is terminated now 
	  if (err){
	  	console.log(err);
	  }
	  callback(err, result);
	});
}
 
