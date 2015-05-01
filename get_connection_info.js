module.exports.getConnectionInfo = getConnectionInfo;

var request = require('request');
var async = require('async');
var _ = require('underscore');

var api_url = "https://api.backand.com:8080";
var tokenUrl = api_url + "/token";
var connectionInfoUrl = "https://api.backand.com:8079/admin/myApps/";
// https://api.backand.com:8079/admin/myApps/testsql?deep=true
var connectionPasswordUrl = "https://api.backand.com:8079/admin/myAppConnection/getPassword/";


// testGetConnectionInfo();

function testGetConnectionInfo(){
	var email = "kornatzky@me.com";
	var password = "secret";
	var appName = "testsql";

	// get token
	request(

		{
		    url: tokenUrl,
		    
		    method: 'POST',
		   
		    form: {
		        username: email,
		        password: password,
		        appname: appName,
		        grant_type: "password"
		    }
		}, 

		function(error, response, body){
			console.log(error);
			console.log(response.statusCode);
			console.log(body);	
		    if(!error && response.statusCode == 200) {
		    	var b = JSON.parse(body)
		    	var accessToken = b["access_token"];
		    	var tokenType = b["token_type"];
		    	getConnectionInfo(accessToken, tokenType, appName, function(err, result){
		    		console.log(err);
		    		console.log(result);
		    		process.exit(0);
		    	});
		    }
		    else{
		    	console.log("cannot get token", error, response.statusCode);
		    	process.exit(1);
		    }
		}

	);

}

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