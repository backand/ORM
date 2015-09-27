module.exports.transformJson = transformJson;
module.exports.validValueOfType = validValueOfType;
module.exports.escapeValueOfType = escapeValueOfType;

var _ = require('underscore');
var request = require('request');
var mysql = require('mysql');
var api_url = require('../../config').api_url;
var tokenUrl = api_url + "/token";
var fetchTables = require("../../backand_to_object").fetchTables; 
var validTypes = require("../../validate_schema").validTypes;

var comparisonOperators = ["$in", "$nin", "$lte", "$lt", "$gte", "$gt", "$eq", "$neq", "$not", "$like"];

var mysqlOperator = {
	"$in": "IN",
	"$nin": "NOT IN",
	"$lt": "<",
	"$lte": "<=",
	"$gt": ">",
	"$gte": ">=",
	"$eq": "=",
	"$neq": "!=",
	"$not": "NOT",
	"$union": "UNION",
	"$like": "LIKE"
};

var email = "kornatzky@me.com";
var password = "secret";
var appName = "testsql";

// transformJsonIntoSQL(email, password, appName, 
// 	{
// 		"$union": 	[
// 			{
// 				"object" : "Employees",
// 				"q" : {
// 					"$or" : [
// 						{
// 							"Budget" : {
// 								"$gt" : 20
// 							}
// 						},
// 						{
// 							"Location" : { 
// 								"$like" :  "Tel Aviv"
// 							}
// 						}
// 					]
// 				},
// 				fields: ["Location"],
// 				order: [["X", "asc"], ["Budget", "desc"]]
// 			},
// 			{
// 				"object" : "Person",
// 				"q" : {
// 					"name": "john"
// 				},
// 				fields: ["City"],
// 				limit: 11
// 			}
// 		]
// 	},

// 	false,
// 	function(err, sql){
// 		console.log(err);
// 		if(!err)
// 			console.log(sql);
// 		process.exit(1);
// 	}
// );

function transformJsonIntoSQL(email, password, appName, json, isFilter, callback){
	getDatabaseInformation(email, password, appName, function(err, sqlSchema){
		if (err){
			callback(err);
		}
		else{
			transformJson(json, sqlSchema, isFilter, callback);
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
		    	callback(error? error : "statusCode != 200", null);
		    }
		}

	);
}

/** @variable
 * @name parserState
 * global state of parser
 */

var parserState = {
};

/** @function
 * @name transformJson
 * @description create sql query from json query
 * the workhorse of the algorithm
 * @param {object} json - json query
 * @param {object} sqlSchema - array of json schema of tables with fields: name, fields, items (optional dbname)
 * @param {boolean} isFilter - a filter query allows variables
 * @param {object} callback - function(err, s) where s is the sql statement for the query
 */

function transformJson(json, sqlSchema, isFilter, callback) {
	parserState.sqlSchema = sqlSchema;
	parserState.isFilter = isFilter;
	var result = null;
	var err = null;
	try { 
	 //  var sqlSchema = [
	 //  	{ 
	 //  		"name" : "Employees", 
	 //  		"items": "blabla", 
	 //  		"fields" : {
		// 		"Budget": {
		// 			"dbname": "bbb",
		// 			"type": "float"
		// 		},
		// 		"Location": {
		// 			"type": "string"
		// 		},
		// 		"X": {
		// 			"type": "float"
		// 		},
		// 		"y": {
		// 			"object": "users"
		// 		}
		// 	}
		// },
		// { 
	 //  		"name" : "Person", 
	 //  		"fields" : {
		// 		"Name": {
		// 			"type": "string"
		// 		},
		// 		"City": {
		// 			"type": "string"
		// 		}
		// 	}
		// }
	 //  ];
	  parserState.sqlSchema = sqlSchema;
	  var sqlQuery = generateQuery(json);
	  result = sqlQuery.sql;
	}
	catch (exp) {
		err = exp;
	}
	finally{
		callback(err, result);
	}
}

/** @function
 * @name generateQuery
 * @description computes the sql query and the types of column in output of query
 * the workhorse of the algorithm
 * @param {object} json - json query
 * @param {object} sqlSchema - array of json schema of tables with fields: name, fields, items (optional dbname)
 * @param {boolean} isFilter - a filter query allows variables
 * @param {object} callback - function(err, s) where s is an object with two fields:
 * sql - sql statement for the query
 * fields - array of types of columns as strings
 */

function generateQuery(query){
	var validity = isValidQuery(query);

	if (!validity)
		throw "not valid query";

	switch(validity)
	{
		case "singleTableQuery":
			return generateSingleTableQuery(query);
		break;

		case "unionQuery":
			return generateUnionQuery(query);
		break;

		default:
			throw "Unknown query type";
		break;
	}

}

function generateSingleTableQuery(query){
	var table = _.findWhere(parserState.sqlSchema, { name: query.object });
	var realTableName = _.has(table, "items") ? table.items : query.object;
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
	var limitClause = "";
	var orderByClause = "";
	if (_.has(query, "order")){
		orderByClause = generateOrderBy(query.order, table);
	}
	if (_.has(query, "limit")){
		limitClause = generateLimit(query.limit);
	}
	whereClause = generateExp(query.q, table);
	var sqlQuery = selectClause + " " + fromClause + " " + (whereClause ? "WHERE (" + whereClause + ")" : "") + " " + orderByClause + " " + limitClause;
	var table = _.findWhere(parserState.sqlSchema, { name: query.object });
	if (_.has(query, "fields")){
		var queryFields = _.map(query.fields, function(f){
			return table.fields[f].type;
		});
	}
	else{	
		var queryFields = _.pluck(table.fields, "type");
	}
	return { fields: queryFields, sql: sqlQuery };
}

function generateUnionQuery(query){
	var operands = query["$union"];
	if (!_.isArray(operands))
		throw "A valid union query should have array of queries for union";
	if (operands.length < 2)
		throw "Need at least two queries to do union on";
	
	// check if all queries have the same types of fields so union is possible
	var components = _.map(operands, function(o){
		return generateQuery(o);
	});
	var querySchema = components[0].fields;
	if (!_.every(components, function(c){ return _.isEqual(c.fields, querySchema);	})){
		throw "not all queries in union have the same schema";
	}
	return { 
		fields: querySchema, 
		sql:  _.reduce(
				components, 
				function(memo, v){
					return (memo ? memo + " UNION ": memo) + v.sql;
				}, 
				""
			)
	};
}

function generateOrderBy(orderArray, table){
	if (!_.isArray(orderArray))
		throw "An order spec should be an array";
	if (!_.every(orderArray, function(o){
		var v =  _.isArray(o) && o.length == 2 && _.isString(o[0]) && (o[1] == "asc" || o[1] == "desc") &&
			_.has(table.fields, o[0]) &&  _.includes(validTypes, table.fields[o[0]].type);
		return v;
	}))
		throw "Not a valid order spec";

	return "ORDER BY " + _.reduce(
		_.map(orderArray, function(o){
			return o[0] + " " + o[1];
		}), 
		function(memo, v){
			return (memo ? memo + " , ": memo) + v;
		}, 
		""
	);
}

function generateLimit(limit){
	if (!_.isNumber(limit) || !_.isFinite(parseInt(limit, 10)) || parseInt(limit, 10) != limit)
		throw "limit should be integer";
	return "LIMIT " + limit;
}

function generateExp(exp, table){
	if (isOrExp(exp)){ // OrExp
		var orExpArray = exp["$or"].map(function(a){
			return generateExp(a, table);
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
				var r = generateKeyValueExp(keyValueExp, table);
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
	if (!_.isObject(q))
		return false;
	var keys = _.keys(q);
	if (!_.isArray(keys))
		return false;
	if (_.includes(keys, "q") && _.includes(keys, "object")) // single table query
		return "singleTableQuery";
	else if (_.includes(keys, "$union") && keys.length == 1);  // union query
		return "unionQuery";
	return false;
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


function generateKeyValueExp(kv, table){
	var keys = Object.keys(kv);
	var column = keys[0];
	if (column == "$exists") { // exists expression
		if (keys.length > 1){
			throw "Not a valid exists expression";
		}
		else{
			var subquery = generateQuery(kv[column]);
			return "EXISTS (" + subquery.sql + " )";
		}
	}
	else{
		if (parserState.isFilter && isVariable(kv[column])){
			var t = getType(table, column);
			return column + " = " + escapeVariableOfType(kv[column], t);
		}
		else if (isConstant(kv[column])){ 
			// constant value
			var t = getType(table, column);
			if (!validValueOfType(kv[column], t)){
				throw "not a valid constant for column " + column + " of table " + (table.items ? table.items : table.name);
			}
			return column + " = " + escapeValueOfType(kv[column], t);
		}
		else if (kv[column]["$not"]){ // Not Exp value
			return "NOT " + generateQueryConditional(kv[column]["$not"], table, column);
		}
		else { // Query Conditional value
			return column + " " + generateQueryConditional(kv[column], table, column);
		}
	}

}



function generateQueryConditional(qc, table, column){
	var keys = Object.keys(qc);
	var comparisonOperator = keys[0];
    if (!isValidComparisonOperator(comparisonOperator))
    	throw "not valid query Conditional";
	var comparand = qc[comparisonOperator];
	var generatedComparand = " ";
	if (parserState.isFilter && isVariable(comparand)){
		var t = getType(table, column);
		generatedComparand = escapeVariableOfType(comparand, t);
	}
	else if (comparisonOperator == "$like" && (table.fields[column].type != "string" && table.fields[column].type != "text")){
		throw "$like is not valid for column " + column + " of table " + table.name + " because it is not a string or text column";
	}
	else if (isConstant(comparand)){
		// constant value
		var t = getType(table, column);
		if (!validValueOfType(comparand, t)){
			throw "not a valid constant for column " + column + " of table " + (table.items ? table.items : table.name);
		}
		generatedComparand = escapeValueOfType(comparand, t);
	}
	else if (Array.isArray(comparand)){ // array
		generatedComparand = comparand;
	}
	else{ // sub query
		var subquery = generateQuery(comparand);
		generatedComparand = "( " + subquery.sql + " )";
	}

	return mysqlOperator[comparisonOperator] + " " + generatedComparand;
}

function isConstant(value){
	return (typeof value) == 'number' || (typeof value) == 'string' || (typeof value) == "boolean";
}

/** @function
 * @name isVariable
 * @param {string} value
 * @returns {boolean} - is the value the name of a variable
 */

function isVariable(value){
	return _.isString(value) && /^#[a-zA-Z]\w*#$/.test(value);
}

function isValidComparisonOperator(comparison){
	return _.includes(comparisonOperators, comparison);
}

/** @function
 * @name getType
 * @param {object} table - table json definition, including items for dbname
 * @param {string} field - column name
 * @returns {string} - type of column
 */

function getType(table, field){
	var fields = table.fields;
	if (_.has(fields, field)){
		return fields[field]["type"];
	}
	else {
		return null;
	}
}

/** @function
 * @name validValueOfType
 * @param {object} value - value to be tested
 * @param {string} type - type of column
 * @returns {boolean} - is the value valid for the type
 */


function validValueOfType(value, type){
	switch(type)
	{
		case "string":
		case "text":		
			return _.isString(value);
		break;

		case "float":
			return _.isNumber(value);
		break;

		case "datetime":
			var d = new Date(value);
			return d instanceof Date;
		break;

		case "boolean":
			return value == 0 || value == 1;
		break;

		case "binary":
			return _.isString(value) && /^[01]+$/.test(value);
		break;

		default: 
			return true;
		break;
	}
}

/** @function
 * @name escapeValueOfType
 * @description escape an input value according to type
 * @param {object} value - value to be assigned to column
 * @param {string} type - type of column
 * @returns {object} - escaped value
 */

function escapeValueOfType(value, type){

	switch(type)
	{
		case "string":
		case "text":
		case "float":		
		case "boolean":
		case "binary":
			return mysql.escape(value);	
		break;

		case "datetime":
			var d = new Date(value);
			return "FROM_UNIXTIME(" + d.valueOf() + ")";
		break;


		default: 
			return mysql.escape(value);
		break;
	}
}

/** @function
 * @name escapeVariableOfType
 * @description escape a variable to be substituted according to type
 * does nothing, because we cannot really escape without knowing the value
 * @param {string} variable - variable name to be later substituted
 * @param {string} type - type of column
 * @returns {object} - escaped value
 */

function escapeVariableOfType(value, type){

	return value;
}
