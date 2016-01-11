module.exports.getConnectionInfo = getConnectionInfo;

var request = require('request');
var async = require('async');
var _ = require('underscore');

var api_url = require('./configFactory').getConfig().api_url;

var connectionInfoUrl = "https://api.backand.com:8079/admin/myApps/";
// https://api.backand.com:8079/admin/myApps/testsql?deep=true
var connectionPasswordUrl = "https://api.backand.com:8079/admin/myAppConnection/getPassword/";

function getConnectionInfo(accessToken, tokenType, appName, getCallback){
	
	async.parallel(
		{
			connectionString: function(callback){
				request(

					{
					    url: connectionInfoUrl + appName + "?deep=true",

					    headers: {
					    	'Accept': 'application/json', 
					        'Content-Type': 'application/json',
					        'Authorization': tokenType + " " + accessToken
					    },
					    
					    method: 'GET'
					},

					function(error, response, body){	
					    if(!error && response.statusCode == 200) {
					    	var body = JSON.parse(body);
					    	var databaseConnection = body["Database_Connection"];					    	
					    	var info = { 
					    		hostname: databaseConnection["ServerName"],
					    		port: databaseConnection["ProductPort"], 
					    		db: databaseConnection["Catalog"], 
					    		username: databaseConnection["Username"]   
					    	};
					    	callback(null, info);
					    }
					    else{
					    	console.log("cannot get connection string", error, response.statusCode);
					    	if (error)
						    	callback(error);
						    else
						    	callback(response.statusCode);
					    }
					}

				);
			},

			connectionPassword: function(callback){
				request(

					{
					    url: connectionPasswordUrl + appName,

					    headers: {
					    	'Accept': 'application/json', 
					        'Content-Type': 'application/json',
					        'Authorization': tokenType + " " + accessToken
					    },
					    
					    method: 'GET'
					},

					function(error, response, body){	
					    if(!error && response.statusCode == 200) {
					    	var body = JSON.parse(body);
					    	callback(null, body);
					    	
					    }
					    else{
					    	console.log("cannot get password", error, response.statusCode);
					    	if (error)
						    	callback(error);
						    else
						    	callback(response.statusCode);
					    }
					}

				);
			}
		},

		function(err, results){
			if (err){
				getCallback(err);
			}
			else{
				var r = _.extend(results.connectionString, { password: results.connectionPassword });
				getCallback(err, r);
			}
			
			
		}

	)

}