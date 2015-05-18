module.exports.fetchTables = fetchTables;

var request = require('request');
var async = require('async');
var _ = require('underscore');


var api_url = "http://api.backand.info:8099";
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
		    	fetchTables(accessToken, tokenType);
		    }
		    else{
		    	console.log("cannot get token", error, response.statusCode);
		    	process.exit(1);
		    }
		}

	);

}

function fetchTables(accessToken, tokenType, callback){
	
	request(

		{
		    url: tableUrl,

		    headers: {
		    	'Accept': 'application/json', 
		        'Content-Type': 'application/json',
		        'Authorization': tokenType + " " + accessToken
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
		    			function(item, callback){
		    				var relationName = item.name
								var databaseName = item.databaseName;
		    				fetchColumns(accessToken, tokenType, relationName,databaseName, callback);
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
		    	
		    }
		    else{
		    	console.log("cannot get tables", error, response.statusCode);
		    	callback(true, null);
		    }
		}

	);
}

function fetchColumns(accessToken, tokenType, tableName, dbName, callbackColumns){

	request(

		{
		    url: columnsUrl + tableName,

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

		    	// console.log(body.fields);
	    		async.map(body.fields,
	    			function(item, callback){
	    				if (item.name == "id" || item.name =="Id"){
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
	    				callbackColumns(null, { name: tableName, dbName: dbName, fields: fields });
	    			}
	    		);
		    	
		    }
		    else{
		    	console.log("cannot get tables", error, response.statusCode);
		    	callbackColumns(error ? error : response.statusCode, null);
		    }
		}

	);

}