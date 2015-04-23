var _ = require('underscore');

var validTypes = ["string",	"text", "integer", "float", "date", "time", "datetime", "boolean", "binary"];




// str - string representing schema in JSON

// return object with fields
// valid - boolean
// warnings - array of strings

// var v = validateSchema(JSON.stringify(
// [
// 	{ 
// 		name: "R", 
// 		attributes: {
// 			a: {
// 				type: "integer"
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
// 		attributes: {
// 			h: {
// 				type: "integer"
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
// 		attributes: {
// 			z: {
// 				type: "integer"
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
// 		attributes: {
// 			c: {
// 				type: "integer"
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
// 		attributes: {
// 			name: {
// 				type: 'string'
// 			},
// 			age: {
// 				type: 'date'
// 			},
// 			dogs:{
// 				collection: 'pet',
// 				via: 'owner'
// 			}
// 		}
// 	},
// 	{ 

// 		name: "pet",

// 		attributes: {
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

// 		attributes: {
// 						name: {
// 				type: 'string'
// 			},
// 			age: {
// 				type: 'date'
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

// 		attributes: {
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
// ));
// console.log(v);

function validateSchema(str){
	try{
		var schema = JSON.parse(str);
		
		if (!Array.isArray(schema)){
			return { valid: false, warnings: ["should be array of table definitions"]};
		}
		var relationships = [];

		var result = _.reduce(schema, function(memo, value){
			var currentResult = validRelation(value);
			console.log(currentResult);
			memo.warnings.push(currentResult.warnings);
			
			var relationshipsCheck = getRelationships(value);
			console.log("relationshipsCheck", relationshipsCheck);
			relationships.push(relationshipsCheck.relationships);
			memo.warnings.push(relationshipsCheck.warnings);

			return { valid: memo.valid && currentResult.valid && relationshipsCheck.valid, warnings: _.flatten(memo.warnings) };
		}, { valid: true, warnings: [] });

		console.log(result);
		var relationships = _.flatten(relationships);
		console.log(relationships);
		// validate the two sides of a relationship
		_.each(relationships, 
			function(r){
				console.log("r", r);
				if (r.type == "n"){
					var fn = _.filter(relationships, function(o){
						console.log("o", o);
						return r.collection == o.relation && o.collection == r.relation && o.via == r.attribute && r.via == o.attribute && o.type == "n";
					});
					console.log("fn", fn);
					var otherSideM = fn.length > 0 ? _.first(fn) : null;
					console.log(otherSideM);
					if (!otherSideM){
						var fone = _.filter(relationships, function(o){
							return o.object == r.relation && r.collection == o.relation && r.via == o.attribute && o.type == "one";
						})
						console.log("fone", fone);
						var otherSide1 = fone.length > 0 ? _.first(fone) : null;
						console.log(otherSide1);
						if (!otherSide1){
							result.warnings.push("multi select relationship of relation " + r.relation + " attribute " + r.attribute + " has no other side");
							result.valid = false;
						}
							
					}
				}
				else if (r.type == "one"){
					var fone = _.filter(relationships, function(o){
						console.log("o", o);
						return r.object == o.relation && o.collection == r.relation && o.via == r.attribute && o.type == "n";
					});
					console.log("fone", fone);
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
	console.log(relation);
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

	if (!_.has(relation, "attributes")){
		valid = false;
		warnings.push("relations should have attributes:" + relationName);
	}
	else if (!(_.isObject(relation.attributes) && !_.isArray(relation.attributes))){
		valid = false;
		warnings.push("relation attributes is an object:" + relationName);
	}
	else{
		_.each(relation.attributes, function(value, key){
			
			if (!_.has(value, "type")){

				if (_.has(value, "collection") && _.has(value, "via")){
					if (_.has(value, "object")){
						valid = false;
						warnings.push("column cannot be both 1 and many side of relatinship:" + relationName + " " + key);
					}			
				}
				else if (_.has(value, "object")){
					if (_.has(value, "collection") || _.has(value, "via")){
						valid = false;
						warnings.push("column cannot be both 1 and many side of relatinship:" + relationName + " " + key);
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
			if (_.has(value, "required") && value.required != true && value.required != false){
				valid = false;
				warnings.push("column required property should be boolean:" + relationName + " " + key);
			}
		});
	}

	return { valid: valid, warnings: warnings };

}

// fetch relationships on a relation
// determine validity of attributes involved in relationship
// compute warnings for relationship validity
// returns object :
// { valid: <boolean>, warnings: <array of string>, relationships: <array of describing relationship attributes> }
// relationship attribute: 
// for one side 
// { relation: <relation name>, attribute:<name of attribute>, object: <attribute object field>, type: "one" }
// for many side 
// { relation: <relation name>, attribute:<name of attribute>, collection: <attribute collection field>, via: <attribute via field>, type: "n" }

function getRelationships(relation){
	console.log("getRelationships", relation);
	// either structure is invalid, or cannot determine relationships
	if (!(_.isObject(relation) && !_.isArray(relation) && _.has(relation, "name") && _.has(relation, "attributes") && _.isObject(relation.attributes) && !_.isArray(relation.attributes)))
		return { valid: true, relationships: null, warnings: [], relationships:[] };

	var valid = true;
	var warnings = [];

	// var attributesCollection = [];
	// _.each(relation.attributes, function(value, key){ 
	// 	console.log(value, key);
	// 	console.log(_.has(value,"collection"));
	// 	if (_.has(value,"collection"))
	// 		attributesCollection.push(_.extend(value, { attribute: key })); 
	// });
	// var attributesVia = [];
	// _.each(relation.attributes, function(value, key){  
	// 	console.log(value, key);
	// 	if (_.has(value,"via"))
	// 		attributesVia.push(_.extend(value, { attribute: key })); 
	// });
	// console.log(attributesCollection, attributesVia);

	// var attributesCollectionNames = _.pluck(attributesCollection, "attribute");
	// var attributesViaNames = _.pluck(attributesVia, "attribute");
	// console.log(attributesCollectionNames, attributesViaNames);
	// console.log(_.difference(attributesCollectionNames, _.attributesViaNames));
	// console.log(_.difference(attributesViaNames, attributesCollectionNames));
	// var notFullRelationshipAttributes = _.union(_.difference(attributesCollectionNames, _.attributesViaNames), 
	// 	_.difference(attributesViaNames, attributesCollectionNames));
	// console.log(notFullRelationshipAttributes);
	// if (notFullRelationshipAttributes.length > 0){
	// 	valid = false;
	// 	_.each(notFullRelationshipAttributes, function(a){
	// 		warnings.push("relation " + relation.name + " relation attribute " + a + 
	// 			" involved in a relationship on the 1 side should include both a 'collection' and a 'via' field");
	// 	});
	// }
	// console.log(notFullRelationshipAttributes);
	var relationships = [];
	_.each(relation.attributes, function(value, key){ 
		console.log(value, key);
		if (_.has(value, "collection") && _.has(value, "via")){
			console.log("collection and via");
			relationships.push(_.extend(value, { relation: relation.name, attribute: key, type: "n" }));
		}
		else if (_.has(value, "object")){
			console.log("object");
			relationships.push({ relation: relation.name, attribute: key, object: value.object, type: "one" });
		}
	});
	console.log(relationships);
	

	return { valid: valid, warnings: warnings, relationships: relationships };
	
}