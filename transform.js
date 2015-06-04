module.exports.transformer = transform;

var _ = require('underscore');
var TAFFY = require('taffy');
var knex = require('knex')({
  client: 'mysql'
});

// var s = knex.schema.createTable('users', function (table) {
//   table.increments();
//   var column = table.string('name');
//   // console.log(column);
// //  column.notNullable(); 
//   table.timestamps();
// });
// console.log(s.toString());

// process.exit(1);


// oldSchema - json
// newSchema - json

// severity - 
// 0 validate transform based on schemes only
// 1 validate transform based on schemes and current data 

/* returns: json
 
 {  
    valid: string - "always" - perfectly valid, "data" - valid with warnings, depends on actual data, "never" - invalid,
	warnings: <array of strings of warnings/errors>
    alter: <array of strings of SQL statements to alter schema>
  }
*/

// warnings

var columnTypeConflict = "column type conflict";
var relationshipTypeConflict = "conversion between type and relationship";

// table of types that can allow for alter, e.g. int to float, varchar(x) to varchar(y) if y > x 

var validTransformDegree = TAFFY([

	{ from: "string", to: "string", degree: "always"},
	{ from: "string", to: "text", degree: "data"},
	// { from: "string", to: "integer", degree: "data"},
	{ from: "string", to: "float", degree: "data"},
	// { from: "string", to: "date", degree: "data"},
	// { from: "string", to: "time", degree: "data"},
	{ from: "string", to: "datetime", degree: "data"},
	{ from: "string", to: "boolean", degree: "never"},
	{ from: "string", to: "binary", degree: "never"}, 

	{ from: "text", to: "string", degree: "data"},
	{ from: "text", to: "text", degree: "always"},
	// { from: "text", to: "integer", degree: "data"},
	{ from: "text", to: "float", degree: "data"},
	// { from: "text", to: "date", degree: "data"},
	// { from: "text", to: "time", degree: "data"},
	{ from: "text", to: "datetime", degree: "data"},
	{ from: "text", to: "boolean", degree: "never"},
	{ from: "text", to: "binary", degree: "never"},

	// { from: "integer", to: "string", degree: "always"},
	// { from: "integer", to: "text", degree: "always"},
	// { from: "integer", to: "integer", degree: "always"},
	// { from: "integer", to: "float", degree: "always"},
	// { from: "integer", to: "date", degree: "never"},
	// { from: "integer", to: "time", degree: "never"},
	// { from: "integer", to: "datetime", degree: "never"},
	// { from: "integer", to: "boolean", degree: "data"},
	// { from: "integer", to: "binary", degree: "always"},

	{ from: "float", to: "string", degree: "always"},
	{ from: "float", to: "text", degree: "always"},
	// { from: "float", to: "integer", degree: "always"},
	{ from: "float", to: "float", degree: "always"},
	// { from: "float", to: "date", degree: "never"},
	// { from: "float", to: "time", degree: "never"},
	{ from: "float", to: "datetime", degree: "never"},
	{ from: "float", to: "boolean", degree: "never"},
	{ from: "float", to: "binary", degree: "always"},

	{ from: "date", to: "string", degree: "always"},
	{ from: "date", to: "text", degree: "always"},
	// { from: "date", to: "integer", degree: "never"},
	{ from: "date", to: "float", degree: "never"},
	// { from: "date", to: "date", degree: "always"},
	// { from: "date", to: "time", degree: "never"},
	{ from: "date", to: "datetime", degree: "always"},
	{ from: "date", to: "boolean", degree: "never"},
	{ from: "date", to: "binary", degree: "never"},

	// { from: "time", to: "string", degree: ""},
	// { from: "time", to: "text", degree: ""},
	// { from: "time", to: "integer", degree: ""},
	// { from: "time", to: "float", degree: ""},
	// { from: "time", to: "date", degree: ""},
	// { from: "time", to: "time", degree: ""},
	// { from: "time", to: "datetime", degree: ""},
	// { from: "time", to: "boolean", degree: ""},
	// { from: "time", to: "binary", degree: ""},

	{ from: "datetime", to: "string", degree: "string"},
	{ from: "datetime", to: "text", degree: "string"},
	// { from: "datetime", to: "integer", degree: "never"},
	{ from: "datetime", to: "float", degree: "never"},
	// { from: "datetime", to: "date", degree: "always"},
	// { from: "datetime", to: "time", degree: "never"},
	{ from: "datetime", to: "datetime", degree: "always"},
	{ from: "datetime", to: "boolean", degree: "never"},
	{ from: "datetime", to: "binary", degree: "never"},

	{ from: "boolean", to: "string", degree: "always"},
	{ from: "boolean", to: "text", degree: "always"},
	// { from: "boolean", to: "integer", degree: "always"},
	{ from: "boolean", to: "float", degree: "always"},
	// { from: "boolean", to: "date", degree: "never"},
	// { from: "boolean", to: "time", degree: "never"},
	{ from: "boolean", to: "datetime", degree: "never"},
	{ from: "boolean", to: "boolean", degree: "always"},
	{ from: "boolean", to: "binary", degree: "always"},

	{ from: "binary", to: "string", degree: "never"},
	{ from: "binary", to: "text", degree: "never"},
	// { from: "binary", to: "integer", degree: "never"},
	{ from: "binary", to: "float", degree: "never"},
	// { from: "binary", to: "date", degree: "never"},
	// { from: "binary", to: "time", degree: "never"},
	{ from: "binary", to: "datetime", degree: "never"},
	{ from: "binary", to: "boolean", degree: "never"},
	{ from: "binary", to: "binary", degree: "never"}
]);



var escalationTable = TAFFY([
	{ current: "always", change: "data", next: "data" },
	{ current: "always", change: "never", next: "never" },
	{ current: "always", change: "always", next: "always" },
	{ current: "data", change: "data", next: "data" },
	{ current: "data", change: "never", next: "never" },
	{ current: "data", change: "always", next: "data" },
	{ current: "never", change: "data", next: "never" },
	{ current: "never", change: "never", next: "never" },
	{ current: "never", change: "always", next: "never" },
]);



// var r = transform(
// [],
// [
// 	{

// 		name: "S",


// 		fields: {
// 			C: {
// 				type: "integer"
// 			},

// 			D: {
// 				type: "string",
// 				required: true
// 			}
// 		}
// 	},

// 	// {

// 	// 	name: "U",


// 	// 	fields: {
// 	// 		E: {
// 	// 			type: "integer"
// 	// 		},

// 	// 		F: {
// 	// 			type: "string",
// 	// 			required: true
// 	// 		},

// 	// 		H: {
// 	// 			type: "string"
// 	// 		}
// 	// 	}
// 	// },

	


// ], 
// [
	
	// {
	// 	"name": "user",
	// 	"fields": {
	// 		"name": {
	// 			"type": "string"
	// 		},
	// 		"age": {
	// 			"type": "datetime"
	// 		},
	// 		"dogs":{
	// 			"collection": "pet",
	// 			"via": "owner"
	// 		}
	// 	}
	// },

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


// ], 0);

// console.log(JSON.stringify(r));
// console.log("statements");
// _.each(r.alter, function(s){
// 	console.log(s);
// });

function transform(oldSchema, newSchema, severity){
	// console.log(oldSchema, newSchema, severity);

	// Compare the JSON
	var modifications = compareSchemes(oldSchema, newSchema, severity);
    // console.log(JSON.stringify(modifications));
	// Determine validity 
	var validity = isValidTransformation(oldSchema, newSchema, modifications);
	// console.log(validity);


	if (severity == 0 && validity.valid != "always"){
		return validity;
	}
	else if (severity == 1 && validity.valid == "never"){
		return validity;
	}


	// Construct an array of the required changes between schemes
	var alterStatementsArray = createStatements(oldSchema, newSchema, modifications);

	// remove created at and updated at columns
	alterStatementsArray = _.map(alterStatementsArray, function(s){
		return s.replace(/, `created_at` datetime/g,"").replace(/, `updated_at` datetime/g,"");
	})

	// describe the order of the database
	var tablesOrder = _.pluck(newSchema, "name");
	var columnsOrder = _.map(newSchema, function(t){
		return _.keys(t.fields);
	});
	var orderStructure = { tables: tablesOrder, columns: _.object(tablesOrder, columnsOrder) };
	
	return _.extend(validity, { alter: alterStatementsArray, order: orderStructure });

}

function compareRelationSets(oldDb, newDb){
	
	var oldRelationNames = _.pluck(oldDb, "name");
	var newRelationNames = _.pluck(newDb, "name");
	var droppedRelationNames = _.difference(oldRelationNames, newRelationNames);
	var addedRelationNames = _.difference(newRelationNames, oldRelationNames);
	var existingRelationNames = _.intersection(oldRelationNames, newRelationNames);
	
	var oldRelationships = getRelationships(oldDb);
	var newRelationships = getRelationships(newDb);


	return { dropTable: droppedRelationNames, createTable: addedRelationNames, commonTables: existingRelationNames, oldRelationships: oldRelationships, newRelationships: newRelationships };

}

function compareSchemes(oldSchema, newSchema) {
	var databaseModifications = compareRelationSets(oldSchema, newSchema);

	var relationsModifications = [];
	// for each relation that existed before and after
	_.each(databaseModifications.commonTables, function(c){
		var relationModification = compareRelationSchemes(_.first(_.where(oldSchema, { name: c })), _.first(_.where(newSchema, { name: c })));
		if (relationModification){
			relationsModifications.push(relationModification);
		}
	});

	return _.extend(databaseModifications, {  modifiedTables: relationsModifications });
	
	
}

function compareRelationSchemes(oldRelation, newRelation){
	// console.log("compareRelationSchemes", oldRelation, newRelation);

	// For the same relation R, in the two schemes, compare the set of column names
	// Obtain set of column add and column drop changes
	var oldColumnNames = _.keys(oldRelation.fields);
	var newColumnNames = _.keys(newRelation.fields);
	var droppedColumnNames = _.difference(oldColumnNames, newColumnNames);
	var addedColumnNames = _.difference(newColumnNames, oldColumnNames);
	var existingColumnNames = _.intersection(oldColumnNames, newColumnNames);

	// obtain set of column modifications
	var modifiedColumns = [];
	_.each(existingColumnNames, function(column){
		var typeHasChanged = oldRelation.fields[column].type != newRelation.fields[column].type;
		var requiredHasChanged =  oldRelation.fields[column].required ? !newRelation.fields[column].required : newRelation.fields[column].required;
		if (typeHasChanged || requiredHasChanged){
			modifiedColumns.push(column);
		}
	});

	return {
		name: oldRelation.name, dropped: droppedColumnNames, added: addedColumnNames, modified: modifiedColumns
	};

}

function isValidTransformation(oldSchema, newSchema, modifications){

	

	// table drop is valid if not involved in relationship
	// already tested via schema validation

	var warnings = [];
	var invalid = "always";

	// common tables
	_.each(modifications.modifiedTables, function(modifiedRelation){
		var relationName = modifiedRelation.name;
		var modifiedColumns = modifiedRelation.modified;

		_.each(modifiedColumns, function(column){
			var oldRelation = _.first(_.where(oldSchema, { name: relationName }));
			var newRelation = _.first(_.where(newSchema, { name: relationName }));
			if (!_.has(oldRelation.fields[column], "type") || !_.has(newRelation.fields[column], "type")){ // modified from/to relationship
				warnings.push({ kind: relationshipTypeConflict, relation: relationName, column: column, oldType: oldColumnType, newType: newColumnType });
				invalid = escalateValidity(invalid, "never");
				return;
			}

			var oldColumnType = oldRelation.fields[column].type;
			var newColumnType = newRelation.fields[column].type;
			if (oldColumnType !=  newColumnType){
				var conformityDegree = validTypeTransform(oldColumnType, newColumnType);
				switch(conformityDegree)
				{
					case "never":
						warnings.push({ kind: columnTypeConflict, relation: relationName, column: column, oldType: oldColumnType, newType: newColumnType });
						invalid = escalateValidity(invalid, "never");
					break;

					case "data":
						warnings.push({ kind: columnTypeConflict, relation: relationName, column: column, oldType: oldColumnType, newType: newColumnType });
						invalid = escalateValidity(invalid, "data");
					break;

					default:
					break;
				}


			}
		});

		// column drop is valid unless involved in relationship
		// already tested via schema validation

		// column add is always valid

	});
	var v = { valid: invalid, warnings: warnings };
	return v;
	
}




function escalateValidity(oldValidity, changeValidity){
	var tuple = escalationTable({ current: oldValidity, change: changeValidity }).first();
	if (tuple){
		return tuple.next;
	}
	return "never";
}



function validTypeTransform(oldColumnType, newColumnType){
	var tuple = validTransformDegree({ from: oldColumnType, to: newColumnType }).first();
	if (tuple){
		return tuple.degree;
	}
	return "never";
}

// match relationships in schema
function getRelationships(newSchema){

	var newRelationships = [];

	// first match 1:n relationships
	_.each(newSchema, function(r){
		_.each(r.fields, function(valueOne, keyOne){
			if (valueOne.object){ // 1:n, 1 side, seek n side
				var nSideRelation = _.findWhere(newSchema, { name: valueOne.object });
				var nSideAttribute = null;
				_.each(nSideRelation.fields, function(value, key){
					if (keyOne == value.via && value.collection == r.name){
						newRelationships.push({ type: "1:n", oneRelation: r.name, nRelation: nSideRelation.name, oneAttribute: keyOne, nAttribute: key });
					}
				});
			}
		});
	});

	// match n:n relationships
	_.each(newSchema, function(r){
		_.each(r.fields, function(valueN, keyN){
			if (_.has(valueN, "collection")){ // 1:n or n:n, n side, seek other side
				var otherSide = _.findWhere(newRelationships, { nRelation: r.name, nAttribute: keyN });
				if (!otherSide){
					otherSide = _.findWhere(newRelationships, { mRelation: r.name, mAttribute: keyN });
				}
				if (!otherSide){ // other side not created yet. because all 1:n already matched, it is n:n
					newRelationships.push({ type: "n:n", mRelation: r.name, nRelation: valueN.collection, mAttribute: keyN, nAttribute: valueN.via });
				}
			}
		});
	});
	// console.log("getRelationships", newRelationships);
	return newRelationships;
}

// Transform the array of required changes into SQL alter statements
function createStatements(oldSchema, newSchema, modifications){

	var statements = [];
	var oldRelationships = modifications.oldRelationships;
	var newRelationships = modifications.newRelationships;

	// drop tables
	var droppedTables = modifications.dropTable;
	_.each(droppedTables, function(t){
		var oldTableDescription = _.findWhere(oldSchema, { "name" : t });
		var statement = knex.schema.dropTable(oldTableDescription.dbName ?  oldTableDescription.dbName : t );
		statements.push(statement.toString());

		// drop associated relationships
		var relatedRelationships = _.filter(oldRelationships, function(r) { 
			if (r.type == "n:n" && (r.mRelation == t || r.nRelation == t)){		  
				statement = knex.schema.dropTableIfExists(r.mRelation + "_" + r.nRelation + "_" + r.mAttribute + "_" + r.nAttribute);
				statements.push(statement.toString());	
				statement = knex.schema.dropTableIfExists(r.nRelation + "_" + r.mRelation + "_" + r.nAttribute + "_" + r.mAttribute);
				statements.push(statement.toString());	
			}
		});	

	});
	// console.log("delete table", statements);

	// add tables
	var addedTables = modifications.createTable;
	var relationships = [];
	_.each(addedTables, function(t){
		var statement = knex.schema.createTable(t, function (table) {
		  table.increments();
		  table.timestamps();

		  var newTableSchema = _.findWhere(newSchema, { name: t });
		  _.each(newTableSchema.fields, function(description, name){
		  	if (_.has(description, "type")){
			  	switch(description.type){
			  		case "string":
			  			var col = table.string(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "text":
			  			var col = table.text(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "integer":
			  			var col = table.integer(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "float":
			  			var col = table.float(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "date":
			  			table.date(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "time":
			  			table.time(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "datetime":
			  			table.dateTime(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "boolean":
			  			table.specificType(name, "Bit(1)"); 
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  		case "binary":
			  			table.binary(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  		break;
			  	}
			  	if (!_.isUndefined(description.defaultValue)){
			  		col.defaultTo(description.defaultValue); 
			  	}
		  	}
		  	else if (_.has(description, "object")){ // 1 side of 1:n relationship
		  		var searchPattern = { oneRelation: t, oneAttribute: name };
		  		var oneManyRelationship = _.findWhere(newRelationships, searchPattern);
		  		relationships.push(oneManyRelationship);
		  		//var col = table.integer("fk_" + t + "_" + oneManyRelationship.nRelation + "_bkname_" + name);
				// var col = table.integer(name);
				// col.unsigned();
		  		// col.references("id").inTable(oneManyRelationship.nRelation);
		  		table.integer(name).unsigned().references("id").inTable(oneManyRelationship.nRelation);
		  	}
		  	else if (_.has(description, "collection") && _.has(description, "via")){

		  	}
		  });
		    
		});
		var statementString = statement.toString();
		_.each(relationships, function(r){
			statementString = statementString.replace('constraint ' + r.oneRelation + '_' + r.oneAttribute + '_foreign', "constraint " + r.nRelation + "_" + r.oneRelation + "_" + r.oneAttribute + "_bkname_" + r.nAttribute);
		});
		var createStatementsArray = statementString.replace("\n", "").split(";");
		_.each(createStatementsArray, function(s){
			statements.push(s);
		});	

	});
    // console.log("add table", statements);

	// modify tables
	var modifiedTables = modifications.modifiedTables;
	// console.log("modifiedTables", modifiedTables);
	_.each(modifiedTables, function(m){
		var tableName = m.name;
		var oldTableDescription = _.findWhere(oldSchema, { "name" : m.name });
		
		var tableDescription = _.first(_.where(newSchema, { name: tableName }));
		var statement = knex.schema.table(oldTableDescription.dbName ? oldTableDescription.dbName : tableName,function(table){

			// drop columns
			_.each(m.dropped, function(d){
				table.dropColumn(d);
			});

			// add columns
			_.each(m.added, function(d){
				var description = tableDescription.fields[d];
				var name = d;
				if (description.type){
					switch(description.type){
				  		case "string":
				  			var col = table.string(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "text":
				  			var col = table.text(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "integer":
				  			var col = table.integer(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "float":
				  			var col = table.float(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "date":
				  			table.date(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "time":
				  			table.time(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "datetime":
				  			table.dateTime(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "boolean":
				  			table.boolean(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  		case "binary":
				  			table.text(d);
				  			if (description.required){
				  				col.notNullable();
				  			}
				  		break;
				  	}
				  	if (!_.isUndefined(description.defaultValue)){
			  			col.defaultTo(description.defaultValue); 
			  		}
				}
				else if (_.has(description, "object")){ // 1 side of 1:n relationship
			  		var oneManyRelationship = _.findWhere(newRelationships, { oneRelation: m.name, oneAttribute: name });
			  		//var col = table.integer("fk_" + m.name + "_" + oneManyRelationship.nRelation + "_bkname_" + name);
					var col = table.integer(name);
					col.unsigned();
			  		col.references("id").inTable(oneManyRelationship.nRelation);
			  	}			
			});	
		});
		var sArray = statement.toString().replace(";", "").split("\n");
		
		_.each(sArray, function(a){
			if(a != ""){
			    var statementString = a.toString();
			    _.each(relationships, function(r){
				statementString = statementString.replace('constraint ' + r.oneRelation + '_' + r.oneAttribute + '_foreign', "constraint " + r.nRelation + "_" + r.oneRelation + "_" + r.oneAttribute + "_bkname_" + r.nAttribute);
			});
			    statements.push(statementString);
			}
		});
		// console.log("add/drop columns", statements);

		// drop relationships table for dropped columns
		_.each(m.dropped, function(c){
			var columnDescription = tableDescription.fields[c];
			if (_.has(columnDescription, "collection")){
				var relatedRelationships = _.filter(oldRelationships, function(r) { 
					if (type == "n:n" && (r.mRelation == t || r.nRelation == t)){		  
						statement = knex.schema.dropTableIfExists(r.mRelation + "_" + r.nRelation + "_" + r.mAttribute + "_" + r.nAttribute);
						statements.push(statement.toString());	
						statement = knex.schema.dropTableIfExists(r.nRelation + "_" + r.mRelation + "_" + r.nAttribute + "_" + r.mAttribute);
						statements.push(statement.toString());	
					}
				});	
			}
		});

		_.each(m.modified, function(d){
			// var oldAttributeDescription = _.first(_.where(newSchema, { name: tableName })).fields[d];
			var newAttributeDescription = tableDescription.fields[d];
			var oldTableDescription = _.findWhere(oldSchema, { "name" : t });
			var typeClause = "alter table " + oldTableDescription.dbName ? oldTableDescription.dbName : tableName + " modify " + d + " " + newAttributeDescription.type;
			var requiredClause = !_.isUndefined(newAttributeDescription.required) ? " null " : " not null ";
			var defaultClause = !_.isUndefined(newAttributeDescription.defaultValue) ?  " set default " + newAttributeDescription.defaultValue : " "; 
			var statement = typeClause + requiredClause + defaultClause;
			statements.push(statement);
		});
	});
    // console.log("modify table", statements);

    // add new relationships
    _.each(newRelationships, function(nr){
    	if (nr.type == "n:n"){
    		// is there such an old relationship 
    		var a = _.where(oldRelationships, { nRelation: nr.nRelation, nAttribute: nr.nAttribute });
    		if (a.length == 0){
    			a  = _.where(oldRelationships, { mRelation: nr.nRelation, mAttribute: nr.nAttribute });
    			if (a.length == 0){ // no such relation so create one
    				var relationshipName = nr.nRelation + "_" + nr.mRelation + "_" + nr.nAttribute + "_" + nr.mAttribute;
    				var statement = knex.schema.createTable(relationshipName, function (table) {
					  table.increments();
					  table.timestamps();
					  var colN = table.integer("fk_" + nr.nRelation);
					  colN.unsigned();
				  	  colN.references("id").inTable(nr.nRelation);
				  	  var colM = table.integer("fk_" + nr.mRelation);
				  	  colM.unsigned();
				  	  colM.references("id").inTable(nr.mRelation);
					});
					statements.push(statement.toString());
    			}
    		}
    	}
    });

	var statementClasses = _.partition(statements, function(s){
		return s.indexOf("constraint") == -1;
	});
	var statements = statementClasses[0];
	_.each(statementClasses[1], function(s){
		statements.push(s);
	});
    return statements;

}