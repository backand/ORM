module.exports.fetchTables = fetchTables;

var request = require('request');
var async = require('async');
var _ = require('underscore');


var api_url = "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";
var tokenUrl = api_url + "/token";
var tableUrl = api_url + "/1/table/config/";
var columnsUrl = api_url + "/1/table/config/";

var backandToJsonType = {
	"Numeric": "float",
	"ShortText": "string",
	"LongText": "text",
	"Boolean": "boolean",
	"Binary": "binary",
	"DateTime": "datetime",
	"SingleSelect": "SingleSelect",
	"MultiSelect": "MultiSelect"
};

// testBackandToObject();

function testBackandToObject(){
	var email = "itay@backand.com";
	var password = "itay1234";
	var appName = "json2";
	var withDbName = true;

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
		    if(!error && response.statusCode == 200) {
		    	var b = JSON.parse(body)
		    	var accessToken = b["access_token"];
		    	var tokenType = b["token_type"];
		    	fetchTables(accessToken, tokenType, appName, withDbName, function(err, result){
		    		console.log(err);
		    		console.log(result);
		    	});
		    }
		    else{
		    	console.log("cannot get token", error, response.statusCode);
		    	process.exit(1);
		    }
		}

	);

}

function fetchTables(accessToken, tokenType, appName, withDbName, callback){
	
	request(

		{
		    url: tableUrl,

		    headers: {
		    	'Accept': 'application/json', 
		        'Content-Type': 'application/json',
		        'Authorization': tokenType + " " + accessToken,
			'AppName': appName
		    },
		    
		    method: 'GET',

		    qs: {
		        filter: '[{fieldName:"SystemView", operator:"equals", value: false}]',
		        sort: '[{fieldName:"order", order:"asc"}]'
		    }
		},

		function(error, response, body){	
		    if(!error && response.statusCode == 200) {
		    	var body = JSON.parse(body);
		    	if (body.totalRows > 0){

		    		async.map(body.data, 
		    			function(item, callbackColumns){
		    				var relationName = item.name
							var databaseName = item.databaseName;
		    				fetchColumns(accessToken, tokenType, appName, relationName, databaseName, withDbName, callbackColumns);
		    			},
		    			function(err, results){

		    				var tables = _.filter(results, function(r){
		    					return r;
		    				})
		    				console.log("database", JSON.stringify(tables));
		    				// transform tables to create relationships

		    				callback(null, tables);
		    			}
		    		);
		    	}
		    	else{
		    		callback(null, []);
		    	}
		    	
		    }
		    else{
		    	console.log("cannot get tables", error, response.statusCode);
		    	callback(true, null);
		    }
		}

	);
}

function fetchColumns(accessToken, tokenType, appName, tableName, dbName, withDbName, callbackColumns){

	request(

		{
		    url: columnsUrl + tableName,

		    headers: {
		    	'Accept': 'application/json', 
		        'Content-Type': 'application/json',
		        'Authorization': tokenType + " " + accessToken,
			'AppName': appName
		    },
		    
		    method: 'GET'
		},

		function(error, response, body){	
		    if(!error && response.statusCode == 200) {


		    	var body = JSON.parse(body);

		    	// console.log(body.fields);
	    		async.map(body.fields,
	    			function(item, callback){
	    				if (item.name == "id" || item.name == "Id" || item.name == "createAt" || item.name == "updatedAt"){
	    					callback(null, null);
	    				}
	    				else{
	    					var description = { name: item.name, type: backandToJsonType[item.type]};
		    				if (_.has(item, "relatedViewName") && item.relatedViewName)
		    				 	description.relatedViewName = item.relatedViewName;
		    				if (_.has(item, "relatedParentFieldName") && item.relatedParentFieldName)
		    				 	description.relatedParentFieldName = item.relatedParentFieldName;

		    				if (item.required)
		    					description.required = true;
		    				// if (_.has(item, "minValue"))
		    				// 	description.minValue = item.minValue;
		    				// if (_.has(item, "maxValue"))
		    				// 	description.maxValue = item.maxValue;
		    				if (_.has(item, "defaultValue"))
		    					description.defaultValue = item.defaultValue;
		    				if (item.type == "SingleSelect"){
		    					var collection = description.relatedViewName;
		    					description = _.extend(_.omit(description, "type", "relatedViewName", "relatedParentFieldName"), { "object" : collection }); 
		    				}
		    				if (item.type == "MultiSelect"){
		    					var collection = description.relatedViewName;
		    					var via = description.relatedParentFieldName;
		    					description = _.extend(_.omit(description, "type", "relatedViewName", "relatedParentFieldName"), { "collection": collection, "via": via }); 
		    				}

		    				callback(null, description);
	    				}				
	    			},
	    			function(err, results){
	    				var results = _.filter(results, function(r) { return r; });
	    				var fields = _.object(_.pluck(results, "name"), _.map(results, function(c){ return _.omit(c, "name"); }));
	    				var columnsDescription = { name: tableName, fields: fields };
	    				if (withDbName){
	    					columnsDescription[dbName] = dbName;
	    				}
	    				callbackColumns(null, columnsDescription);
	    			}
	    		);
		    	
		    }
		    else{
		    	console.log("fetchColumns cannot get tables", error, response.statusCode);
		    	callbackColumns(error ? error : response.statusCode, null);
		    }
		}

	);

}
