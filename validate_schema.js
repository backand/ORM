var _ = require('underscore');

var validTypes = ["string",	"text", "integer", "float", "date", "time", "datetime", "boolean", "binary"];

// str - string representing schema in JSON

// return object with fields
// valid - boolean
// warnings - array of strings

// var v = validateSchema(JSON.stringify(
// [

// 	{

// 		name: "S",


// 		attributes: {
// 			C: {
// 				type: "integer"
// 			},

// 			D: {
// 				type: "string",
// 				required: 5
// 			}
// 		}
// 	},

// 	{

// 		name: "U",


// 		attributes: {
// 			E: {
// 				type: "integer"
// 			},

// 			F: {
// 				type: "kuku",
// 				required: true
// 			},

// 			H: {
// 				type: "string"
// 			}
// 		}
// 	},


// ]
// )
// );
// console.log(v);

function validateSchema(str){
	try{
		var schema = JSON.parse(str);
		if (!Array.isArray(schema)){
			return { valid: false, warnings: ["should be array of table definitions"]};
		}

		var r = _.reduce(schema, function(memo, value){
			var currentResult = validRelation(value);
			memo.warnings.push(currentResult.warnings);
			return { valid: memo.valid && currentResult.valid, warnings: _.flatten(memo.warnings) };
		}, { valid: true, warnings: [] });
		return r;
	}
	catch(e){
		return { valid: false, warnings: ["not valid JSON"]};
	}
}



function validRelation(relation){

	var warnings = [];
	valid = true;
	if (!(_.isObject(relation) && !_.isArray(relation))){
		return { valid: false, warnings: ["relation definition should be an object"]};
	}
	var relationName = "";
	if (!_.has(relation, "name")){
		valid = false;
		warnings.push("relations should have name");
	}
	else{
		relationName = relation.name;
	}

	if (!_.has(relation, "attributes")){
		valid = false;
		warnings.push("relations should have attributes:" + relationName);
	}
	else if (!(_.isObject(relation) && !_.isArray(relation))){
		valid = false;
		warnings.push("relation attributes is an object:" + relationName);
	}
	else{
		_.each(relation.attributes, function(value, key){
			
			if (!_.has(value, "type")){
				valid = false;
				warnings.push("column should include a type:" + relationName + " " + key);
			}
			else if (!_.contains(validTypes, value.type)){
				valid = false;
				warnings.push("column type is invalid:" + relationName + " " + key);
			}
			if (_.has(value, "required") && value.required != true && value.required != false){
				valid = false;
				warnings.push("column required property should be boolean:" + relationName + " " + key);
			}
		});
	}

	return { valid: valid, warnings: warnings };

}