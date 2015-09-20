function transformJson(string) {
	var sqlQuery = null;
	try { 
	  var json = JSON.parse(string); 
	  sqlQuery = generateQuery(json);
	}
	catch (exp) {
		console.log(exp);
	}
	finally{
		return sqlQuery;
	}
}

function generateQuery(query){
	if (!isValidQuery(query))
		throw "not valid query";

	var selectClause = "SELECT " + (query.fields ? query.fields.join(",") : "*");
	var fromClause = "FROM " + query.table;
	var whereClause = "";
	whereClause = generateExp(query.q);

	var sqlQuery = selectClause + " " + fromClause + " " + (whereClause ? "WHERE (" + whereClause + " )" : "");
	
	return sqlQuery;
}

function generateExp(exp){
	if (isOrExp(exp)){ // OrExp
		var orExpArray = exp["$or"].map(function(a){
			return generateExp(a);
		});
		console.log(orExpArray);
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
				console.log(r);
				return r;
			});
			console.log(andExpArray);
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
	console.log((typeof q));
	console.log(q.q);
	console.log(q.q? 1 : 0);
	console.log(q.table? 1 : 0);
	return ((typeof q) == 'object') && q.q && q.table;
}

function isOrExp(exp){
	
	if (!((typeof exp) == "object"))
		return false;

	var keys = Object.keys(exp);
	var column = keys[0];
	return keys.length == 1 && column == "$or" && Array.isArray(exp[column]);
}

function isValidAndExp(exp){
	console.log((typeof exp));
	if (!((typeof exp) == 'object'))
		return false;
	return true;
}


function generateKeyValueExp(kv){

	var keys = Object.keys(kv);
	var column = keys[0];
	if (isConstant(kv[column])){ // constant value
		return column + " = " + kv[column];
	}
	else if (kv[column]["$not"]){ // Not Exp value
		return "NOT " + generateQueryConditional(kv[column]["$not"]);
	}
	else { // Query Conditional value
		return column + " " + generateQueryConditional(kv[column]);
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
	var r = comparisonOperator + " " + generatedComparand;
	console.log(r);
	return r;
}

function isConstant(value){
	return (typeof value) == 'number' || (typeof value) == 'string' || (typeof value) == "boolean";
}

function isValidComparisonOperator(comparisonOperator){
	var matchingOperators = ["$in", "$nin", "$lte", "$lt", "$gte", "$gt", "$eq", "$neq", "$not", "$size", "$exists"].filter(function(c) {
		return c == comparisonOperator;
	});
	return matchingOperators.length > 0;
}




