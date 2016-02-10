module.exports.getConnectionInfo = getConnectionInfo;
module.exports.getConnectionInfoSimple = getConnectionInfoSimple;
var request = require('request');
var async = require('async');
var _ = require('underscore');

var api_url = require('./configFactory').getConfig().api_url;

var connectionInfoUrl = api_url + "/admin/myApps/";
// https://api.backand.com:8079/admin/myApps/testsql?deep=true
var connectionPasswordUrl = api_url + "/admin/myAppConnection/getPassword/";

function getConnectionInfoSimple2(accessToken, appName, getCallback){
	var aToken = accessToken.split(' ')[1];
	getConnectionInfo(aToken, "bearer", appName, getCallback);
}

function getConnectionInfoUrl(accessToken){
	return connectionInfoUrl.split("://").join("://" + accessToken + "@");
}
function getConnectionPasswordUrl(accessToken){
	return connectionPasswordUrl.split("://").join("://" + accessToken + "@");
}

function getConnectionInfoSimple(accessToken, appName, getCallback){

	async.parallel(
		{
			connectionString: function(callback){
				request(

					{
						url: getConnectionInfoUrl(accessToken) + appName + "?deep=true",

						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},

						method: 'GET'
					},

					function(error, response, body){
						if(!error && response.statusCode == 200) {
							var body = JSON.parse(body);
							var databaseConnection = body["Database_Connection"];
							var info = {
								"multipleStatements": true,
								host: databaseConnection["ServerName"],
								port: databaseConnection["ProductPort"],
								database: databaseConnection["Catalog"],
								user: databaseConnection["Username"]
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
						url: getConnectionPasswordUrl(accessToken) + appName,

						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
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
								"multipleStatements": true,
								host: databaseConnection["ServerName"],
					    		port: databaseConnection["ProductPort"],
								database: databaseConnection["Catalog"],
					    		user: databaseConnection["Username"]
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

function test(){
	var accessToken = "MmwQD904WBS8UlAxCS3jMl0yWh4jovyWIeM1yklNMvkqjpG0lfLBwr5JaOm1G2zhJW1OtnEMaewgK7UGlh95EXUxNaNl6jBIitZbMueK90bq9AfdvTbGYZzuIh_h57c0h39SD00zDrAZ7mLJ0b2cbGuD8RsYpdbMU2rxDNKAHVRcjKbVlTe1oEWkZAX3BlC0rH-udzSnOUD4yMN2yN6erKEWyeE8Uq-MQWsUa6F2-3AK6NWcvNt8G5aZRZoGLRM6_DdOTHz0pukUvEfSj1xi2Q";
	var tokenType = "bearer";
	var appName = "stat01";

	getConnectionInfoSimple(accessToken, tokenType, appName, function(err, r){
		console.log(r);
	})

}

function testBasic(){
	var accessToken = "5050b10d-eaf9-4e65-862b-04bddc296264:ce0d3fd7-aef8-11e5-8680-ecf4bb08283e";
	var appName = "stat01";

	getConnectionInfoSimple(accessToken, appName, function(err, r){
		console.log(r);
	})

}
testBasic();
//test();