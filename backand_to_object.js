process.chdir(__dirname);
module.exports.fetchTables = fetchTables;
module.exports.getUserDetails = getUserDetails;

var request = require('request');
var async = require('async');
var _ = require('underscore');


var api_url = require('./configFactory').getConfig().api_url;
var tokenUrl = api_url + "/token";
var tableUrl = api_url + "/1/table/config/";
var columnsUrl = api_url + "/1/table/config/";
var getUserUrl = api_url + "/api/account/profile";

var backandToJsonType = {
	"Numeric": "float",
	"ShortText": "string",
	"LongText": "text",
	"Boolean": "boolean",
	"Binary": "binary",
	"DateTime": "datetime",
	"SingleSelect": "SingleSelect",
	"MultiSelect": "MultiSelect",
	"Point": "point"
};

function getUserDetails(accessToken, anonymousToken, appName, callback) {
    function isEmpty(str) {
        // source: http://stackoverflow.com/questions/1812245/what-is-the-best-way-to-test-for-an-empty-string-with-jquery-out-of-the-box/33672308#33672308
        return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
    }

    function extractParams() {
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        if (!isEmpty(accessToken)) {
            headers.Authorization = accessToken;
            headers.AppName = appName;
        } else {
            headers.AnonymousToken = anonymousToken;
        }
        return headers;
    }

    var headers = extractParams();
    request(
        {
            url: getUserUrl,
            headers: headers,
            method: 'GET'
        },

        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                if (body.username != '') {
                    callback(false, body);
                }
                else {
                    callback(true, null);
                }

            }
            else {
                callback(true, null);
            }
        }
    );
}


function fetchColumns(accessToken, tokenType, appName, tableName, dbName, withDbName, withIdColumn, callbackColumns){

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
	    		async.map(body.fields,
	    			function(item, callback){
	    				if (!withIdColumn && (item.name == "id" || item.name == "Id")){
	    					callback(null, null);
	    				}
	    				else if (item.name == "createAt" || item.name == "updatedAt"){
	    					callback(null, null);
	    				}
	    				else{
	    					var description = { "name": item.name, "type": backandToJsonType[item.type] };
	    					if (withDbName && item.databaseName){
	    						description["dbName"] = item.databaseName;
	    					}
		    				if (_.has(item, "relatedViewName") && item.relatedViewName)
		    				 	description.relatedViewName = item.relatedViewName;
		    				if (_.has(item, "relatedParentFieldName") && item.relatedParentFieldName)
		    				 	description.relatedParentFieldName = item.relatedParentFieldName;

		    				if (item.advancedLayout.required)
		    					description.required = true;
		    				if (item.advancedLayout.unique)
		    					description.unique = true;

		    				// if (_.has(item, "minValue"))
		    				// 	description.minValue = item.minValue;
		    				// if (_.has(item, "maxValue"))
		    				// 	description.maxValue = item.maxValue;
		    				if (_.has(item.advancedLayout, "defaultValue") && item.advancedLayout.defaultValue !== "")
		    					description.defaultValue = item.advancedLayout.defaultValue;
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
	    				var columnsDescription = { "name": tableName, "fields": fields };
	    				if (withDbName){
	    					columnsDescription["dbName"] = dbName;
	    				}
	    				callbackColumns(null, columnsDescription);
	    			}
	    		);
		    	
		    }
		    else{
		    	callbackColumns(error ? error : response.statusCode, null);
		    }
		}

	);


}

function fetchTables(accessToken, tokenType, appName, withDbName, withIdColumn, callback) {

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
                pageSize:200,
                filter: '[{fieldName:"SystemView", operator:"equals", value: false}]',
                sort: '[{fieldName:"order", order:"asc"}]'
            }
        },

        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                if (body.totalRows > 0) {
                    async.map(body.data,
                        function (item, callbackColumns) {
                            var relationName = item.name
                            var databaseName = item.databaseName;
                            fetchColumns(accessToken, tokenType, appName, relationName, databaseName, withDbName, withIdColumn, callbackColumns);
                        },
                        function (err, results) {
                            var tables = _.filter(results, function (r) {
                                return r;
                            });
                            callback(null, tables);
                        }
                    );
                }
                else {
                    callback(null, []);
                }

            }
            else {
                callback(true, null);
            }
        }
    );
}
