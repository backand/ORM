module.exports.transformJson = transformJson;

var _ = require('underscore');
var request = require('request');
var api_url = require('../../config').api_url;
var tokenUrl = api_url + "/token";
var fetchTables = require("../../backand_to_object").fetchTables; 

var comparisonOperators = ["$in", "$nin", "$lte", "$lt", "$gte", "$gt", "$eq", "$neq", "$not", "$size", "$exists"];

var mysqlOperator = {
	"$in": "IN",
	"$nin": "NOT IN",
	"$lt": "<",
	"$lte": "<=",
	"$gt": ">",
	"$gte": ">=",
	"$eq": "=",
	"$neq": "!=",
	"$not": "NOT"
};

var email = "kornatzky@me.com";
var password = "secret";
var appName = "testsql";

// transformJsonIntoSQL(email, password, appName, 
// 	{
// 		"table" : "Employees",
// 		"q" : {
// 			"$or" : [
// 				{
// 					"Budget" : {
// 						"$gt" : 3000
// 					}
// 				},
// 				{
// 					"Location" : "Tel Aviv"
// 				}
// 			]
// 		},
// 		fields: ["Location", "Budget"]
// 	},

// 	function(err, sql){
// 		console.log(err);
// 		if(!err)
// 			console.log(sql);
// 		process.exit(1);
// 	}
// );

function transformJsonIntoSQL(email, password, appName, json, callback){
	getDatabaseInformation(email, password, appName, function(err, sqlSchema){
		if (err){
			callback(err);
		}
		else{
			transformJson(json, sqlSchema, callback);
		}
	});
}

function getDatabaseInformation(email, password, appName, callback){
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
		    	fetchTables(accessToken, tokenType, appName, true, function(err, result){
		    		callback(err, result);
		    	});
		    }
		    else{
		    	callback(error? error : "statusCode != 200", result);
		    }
		}

	);
}

function transformJson(json, sqlSchema, callback) {
	var sqlQuery = null;
	var err = null;
	try { 
	  sqlQuery = generateQuery(json, sqlSchema);
	}
	catch (exp) {
		err = exp;
	}
	finally{
		callback(err, sqlQuery);
	}
}

function generateQuery(query, sqlSchema){
	if (!isValidQuery(query))
		throw "not valid query";
	var table = _.findWhere(sqlSchema, { name: query.table });
	// table = { "name" : "Employees", "items": "blabla", "fields" : {
	// 	"Budget": {
	// 		"dbname": "bbb"
	// 	},
	// 	"Location": {

	// 	}
	// }};
	var realTableName = _.has(table, "items") ? table.items : query.table;
	if (_.has(query, "fields")){
		var realQueryFields = _.map(query.fields, function(f){
			return table.fields[f].dbName ? table.fields[f].dbName : f;
		});
		var selectClause = "SELECT " + realQueryFields.join(",");
	}
	else{
		var selectClause = "SELECT " + "*";
	}
	
	var fromClause = "FROM " + realTableName;
	var whereClause = "";
	whereClause = generateExp(query.q);
	var sqlQuery = selectClause + " " + fromClause + " " + (whereClause ? "WHERE (" + whereClause + ")" : "");
	return sqlQuery;
}

function generateExp(exp){
	if (isOrExp(exp)){ // OrExp
		var orExpArray = exp["$or"].map(function(a){
			return generateExp(a);
		});
		return orExpArray.map(function(o){
			return "( " + o + " )";
		}).join(" OR ");
	}
	else if (isValidAndExp(exp)) { // AndExp
		var keys = Object.keys(exp)
		if (keys.length > 0){
			var andExpArray = keys.map(function(a){
				var keyValueExp = {};
				keyValueExp[a] = exp[a];
				var r = generateKeyValueExp(keyValueExp);
				return r;
			});
			return andExpArray.join(" AND ");
		}
		else{
			return " 1 == 1 ";
		}
		
	}
	else {
		throw "not valid query";
	} 
}

function isValidQuery(q){
	return  ((typeof q) == 'object') && q.q && q.table;
}

function isOrExp(exp){
	if (!((typeof exp) == "object"))
		return false;

	var keys = Object.keys(exp);
	var column = keys[0];
	return keys.length == 1 && column == "$or" && Array.isArray(exp[column]);
}

function isValidAndExp(exp){
	if (!((typeof exp) == 'object'))
		return false;
	return true;
}


function generateKeyValueExp(kv){
	var keys = Object.keys(kv);
	var column = keys[0];
	if (column == "$exists") { // exists expression
		if (keys.length > 1){
			throw "Not a valid exists expression";
		}
		else{
			return "EXISTS (" + generateQuery(kv[column]) + " )";
		}
	}
	else{
		if (isConstant(kv[column])){ // constant value
			if (_.isString(kv[column])){
				return column + " = '" + kv[column] + "'";
			}
			return column + " = " + kv[column];
		}
		else if (kv[column]["$not"]){ // Not Exp value
			return "NOT " + generateQueryConditional(kv[column]["$not"]);
		}
		else { // Query Conditional value
			return column + " " + generateQueryConditional(kv[column]);
		}
	}

}



function generateQueryConditional(qc){
	var keys = Object.keys(qc);
	var comparisonOperator = keys[0];
    if (!isValidComparisonOperator(comparisonOperator))
    	throw "not valid query Conditional";
	var comparand = qc[comparisonOperator];
	var generatedComparand = " ";
	if (isConstant(comparand)){
		generatedComparand = comparand;
	}
	else if (Array.isArray(comparand)){ // array
		generatedComparand = comparand;
	}
	else{ // sub query
		generatedComparand = "( " + generateQuery(comparand) + " )";
	}
	return mysqlOperator[comparisonOperator] + " " + generatedComparand;
}

function isConstant(value){
	return (typeof value) == 'number' || (typeof value) == 'string' || (typeof value) == "boolean";
}

function isValidComparisonOperator(comparison){
	return _.includes(comparisonOperators, comparison);
}