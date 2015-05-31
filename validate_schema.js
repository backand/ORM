module.exports.validator = validateSchema;

var _ = require('underscore');

var validTypes = ["string",	"text", /*"integer",*/ "float", /*"date", "time",*/ "datetime", "boolean", "binary"];

// str - string representing schema in JSON

// return object with fields
// valid - boolean
// warnings - array of strings

// var v = validateSchema(JSON.stringify(
// [
	
// 	{
// 		"name": "user",
// 		"fields": {
// 			"name": {
// 				"type": "string"
// 			},
// 			"age": {
// 				"type": "datetime"
// 			},
// 			"dogs":{
// 				"collection": "pet",
// 				"via": "owner"
// 			}
// 		}
// 	},

	// { 

	// 	"name": "pet",

	// 	"fields": {
	// 		"name": {
	// 			"type": "string"
	// 		},
	// 		"registered": {
	// 			"type": "boolean"
	// 		},
	// 		"owner":{
	// 			"object": "user"
	// 		}
	// 	}
		
	// },

// 	{
// 		"name": "walker",
// 		"fields": {
// 			"name": {
// 				"type": "string"
// 			},
// 			"age": {
// 				"type": "datetime"
// 			},
// 			"dogs":{
// 				"collection": "animal",
// 				"via": "owners"
// 			}
// 		}
// 	},


// 	{
// 		"name": "animal",
// 		"fields": {
// 			"name": {
// 				"type": "string"
// 			},
// 			"breed": {
// 				"type": "string"
// 			},
// 			"owners":{
// 				"collection": "walker",
// 				"via": "dogs"
// 			}
// 		}
// 	},

// 	{
// 		"name": "R",

// 		"fields": {
// 			"A": {
// 				"type": "float",
// 				"defaultValue": 20
// 			},

// 			"B": {
// 				"type": "string",
// 				"required": true
// 			}
// 		}

// 	},

// 	{

// 		"name": "U",


// 		"fields": {

// 			"F": {
// 				"type": "string",
// 				"required": true
// 			},

// 			"G": {
// 				"type": "float"
// 			},

// 			"H": {
// 				"type": "string"
// 			}
// 		}
// 	}


// ]));

// var v = validateSchema(JSON.stringify(
// [
// 	{ 
// 		name: "R", 
// 		fields: {
// 			a: {
// 				type: "float"
// 			},
// 			b: {
// 				type: "string"
// 			},
// 			dogs: {
// 				collection: "U",
// 				via: "owner"
// 			}
// 		}
// 	},
// 	{ 
// 		name: "S", 
// 		fields: {
// 			h: {
// 				type: "float"
// 			},
// 			j: {
// 				type: "string"
// 			},
// 			people: {
// 				collection: "T",
// 				"via": "myS"
// 			}
// 		}
// 	},
// 	{ 
// 		name: "T", 
// 		fields: {
// 			z: {
// 				type: "float"
// 			},
// 			q: {
// 				type: "string"
// 			},
// 			myS: {
// 				collection: "S",
// 				"via": "people"
// 			}
// 		}
// 	},

// 	{ 
// 		name: "U", 
// 		fields: {
// 			c: {
// 				type: "float"
// 			},
// 			d: {
// 				type: "string"
// 			},
// 			owner: {
// 				object: 'R'
// 			}
// 		}
// 	},
// 	{
// 		name: "user",
// 		fields: {
// 			name: {
// 				type: 'string',
// 				defaultValue: 200
// 			},
// 			age: {
// 				type: 'datetime',
// 				defaultValue: '2015-09-08'
// 			},
// 			dogs:{
// 				collection: 'pet',
// 				via: 'owner'
// 			}
// 		}
// 	},
// 	{ 

// 		name: "pet",

// 		fields: {
// 			name: {
// 				type: 'string'
// 			},
// 			registered: {
// 				type: 'boolean'
// 			},
// 			owner:{
// 				object: 'user'
// 			}
// 		}
		
// 	},


// 	{
// 		name: "person",

// 		fields: {
// 						name: {
// 				type: 'string'
// 			},
// 			age: {
// 				type: 'datetime'
// 			},
// 			dogs:{
// 				collection: 'animal',
// 				via: 'catOwner'
// 			},
// 			cats:{
// 				collection: 'animal',
// 				via: 'dogOwner'
// 			}
// 		}
// 	},



// 	{
// 		name: "animal",

// 		fields: {
// 			name: {
// 				type: 'string'
// 			},
// 			registered: {
// 				type: 'boolean'
// 			},
// 			dogOwner:{
// 				object: 'person'
// 			},
// 			catOwner:{
// 				object: 'person'
// 			}
// 		}
	
// 	}



// ]
// )
// );
console.log(v);

function validateSchema(str){
	try{
		var schema = JSON.parse(str);

		if (!Array.isArray(schema)){
			return { valid: false, warnings: ["should be array of table definitions"]};
		}
		var relationships = [];

		var result = _.reduce(schema, function(memo, value){
			var currentResult = validRelation(value);
			memo.warnings.push(currentResult.warnings);
			
			var relationshipsCheck = getRelationships(value);
			relationships.push(relationshipsCheck.relationships);
			memo.warnings.push(relationshipsCheck.warnings);

			return { valid: memo.valid && currentResult.valid && relationshipsCheck.valid, warnings: _.flatten(memo.warnings) };
		}, { valid: true, warnings: [] });
		var relationships = _.flatten(relationships);

		// validate the two sides of a relationship
		_.each(relationships, 
			function(r){
				if (r.type == "n"){				
					var fn = _.filter(relationships, function(o){
						return r.collection == o.relation && o.collection == r.relation && o.via == r.attribute && r.via == o.attribute && o.type == "n";
					});
					var otherSideM = fn.length > 0 ? _.first(fn) : null;
					if (!otherSideM){
						var fone = _.filter(relationships, function(o){
							return o.object == r.relation && r.collection == o.relation && r.via == o.attribute && o.type == "one";
						})
						var otherSide1 = fone.length > 0 ? _.first(fone) : null;
						if (!otherSide1){
							// result.warnings.push("multi select relationship of relation " + r.relation + " attribute " + r.attribute + " has no other side");
							result.warnings.push("missing one side of one-to-many relationship: relation " + r.relation + " attribute " + r.attribute);
							result.valid = false;
						}
							
					}
					else{
						result.valid = false;
						result.warnings.push("multi select relationship are not allowed: relation " + r.relation + " attribute " + r.attribute + " and relation " + otherSideM.relation + " attribute " + otherSideM.attribute);
					}
				}
				else if (r.type == "one"){
					var fone = _.filter(relationships, function(o){
						return r.object == o.relation && o.collection == r.relation && o.via == r.attribute && o.type == "n";
					});
					var otherSide = fone.length > 0 ? _.first(fone) : null;
					if (!otherSide){
						result.warnings.push("single select relationship of relation " + r.relation + " attribute " + r.attribute + " has no other side");
						result.valid = false;
					}
				}
			}
		);

		return result;
	}
	catch(e){
		return { valid: false, warnings: ["not valid JSON"]};
	}
}



function validRelation(relation){
	var warnings = [];
	var valid = true;
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

	if (!_.has(relation, "fields")){
		valid = false;
		warnings.push("relations should have fields:" + relationName);
	}
	else if (!(_.isObject(relation.fields) && !_.isArray(relation.fields))){
		valid = false;
		warnings.push("relation fields is an object:" + relationName);
	}
	else{
		_.each(relation.fields, function(value, key){

			if (!_.has(value, "type")){

				if (_.has(value, "collection") && _.has(value, "via")){
					if (_.has(value, "object")){
						valid = false;
						warnings.push("column cannot be both 1 and many side of relationship:" + relationName + " " + key);
					}			
				}
				else if (_.has(value, "object")){
					if (_.has(value, "collection") || _.has(value, "via")){
						valid = false;
						warnings.push("column cannot be both 1 and many side of relationship:" + relationName + " " + key);
					}	
				}
				else if (_.has(value, "collection") && !_.has(value, "via")){
					valid = false;
					warnings.push("column on many side of relationship should have both collection and via fields:" + relationName + " " + key);
				}
				else if (!_.has(value, "collection") && _.has(value, "via")){
					valid = false;
					warnings.push("column on many side of relationship should have both collection and via fields:" + relationName + " " + key);
				}
				else{
					valid = false;
					warnings.push("column should include a type:" + relationName + " " + key);
				}
				
			}
			else if (!_.contains(validTypes, value.type)){
				valid = false;
				warnings.push("column type is invalid:" + relationName + " " + key);
			}			
			if (_.has(value, "required") && !_.isBoolean(value.required)){
				valid = false;
				warnings.push("column required property should be boolean:" + relationName + " " + key);
			}
			if (_.has(value, "defaultValue")){
				switch(value.type)
				{
					case "string":
					case "text":
						if (!_.isString(value.defaultValue)){
							valid = false;
							warnings.push("column default value should be a string:" + relationName + " " + key);
						}
					break;
					case "float":
						if (!_.isNumber(value.defaultValue) || _.isNaN(value.defaultValue)){
							valid = false;
							warnings.push("column default value should be a float:" + relationName + " " + key);
						}
					break;
					case "binary":
					break;
					case "datetime":
						if (!_.isDate(new Date(value.defaultValue))){
							valid = false;
							warnings.push("column default value should be a datetime:" + relationName + " " + key);
						}
					break;
					case "boolean":
						if (!_.isBoolean(value.defaultValue)){
							valid = false;
							warnings.push("column default value should be a boolean:" + relationName + " " + key);
						}
					break;
				}
				
			}


		});
	}

	return { valid: valid, warnings: warnings };

}

// fetch relationships on a relation
// determine validity of fields involved in relationship
// compute warnings for relationship validity
// returns object :
// { valid: <boolean>, warnings: <array of string>, relationships: <array of describing relationship fields> }
// relationship attribute: 
// for one side 
// { relation: <relation name>, attribute:<name of attribute>, object: <attribute object field>, type: "one" }
// for many side 
// { relation: <relation name>, attribute:<name of attribute>, collection: <attribute collection field>, via: <attribute via field>, type: "n" }

function getRelationships(relation){

	// either structure is invalid, or cannot determine relationships
	if (!(_.isObject(relation) && !_.isArray(relation) && _.has(relation, "name") && _.has(relation, "fields") && _.isObject(relation.fields) && !_.isArray(relation.fields)))
		return { valid: true, relationships: null, warnings: [], relationships:[] };

	var valid = true;
	var warnings = [];

	var relationships = [];
	_.each(relation.fields, function(value, key){ 
		if (_.has(value, "collection") && _.has(value, "via")){
			relationships.push(_.extend(value, { relation: relation.name, attribute: key, type: "n" }));
		}
		else if (_.has(value, "object")){
			relationships.push({ relation: relation.name, attribute: key, object: value.object, type: "one" });
		}
	});
	
	return { valid: valid, warnings: warnings, relationships: relationships };
	
}