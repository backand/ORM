module.exports.transformer = transform;
module.exports.rename = renameFields;
module.exports.applyRename = applyRename;

var _ = require('underscore');
var TAFFY = require('taffy');
var knex = require('knex')({
  client: 'mysql'
});

// var s = knex.schema.createTable('users', function (table) {
//   table.increments();
//   var column = table.string('name').unique().defaultTo('yoram');
//   console.log(column);
//   column.notNullable(); 
//   table.timestamps();
//   column.references("nom").inTable("students");
//   column.onDelete("cascade");
//   column.onUpdate("cascade");
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
	{ from: "float", to: "point", degree: "never"},

	{ from: "date", to: "string", degree: "always"},
	{ from: "date", to: "text", degree: "always"},
	// { from: "date", to: "integer", degree: "never"},
	{ from: "date", to: "float", degree: "never"},
	// { from: "date", to: "date", degree: "always"},
	// { from: "date", to: "time", degree: "never"},
	{ from: "date", to: "datetime", degree: "always"},
	{ from: "date", to: "boolean", degree: "never"},
	{ from: "date", to: "binary", degree: "never"},
	{ from: "date", to: "point", degree: "never"},

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
	{ from: "datetime", to: "point", degree: "never"},

	{ from: "boolean", to: "string", degree: "always"},
	{ from: "boolean", to: "text", degree: "always"},
	// { from: "boolean", to: "integer", degree: "always"},
	{ from: "boolean", to: "float", degree: "always"},
	// { from: "boolean", to: "date", degree: "never"},
	// { from: "boolean", to: "time", degree: "never"},
	{ from: "boolean", to: "datetime", degree: "never"},
	{ from: "boolean", to: "boolean", degree: "always"},
	{ from: "boolean", to: "binary", degree: "always"},
	{ from: "boolean", to: "point", degree: "always"},

	{ from: "binary", to: "string", degree: "never"},
	{ from: "binary", to: "text", degree: "never"},
	// { from: "binary", to: "integer", degree: "never"},
	{ from: "binary", to: "float", degree: "never"},
	// { from: "binary", to: "date", degree: "never"},
	// { from: "binary", to: "time", degree: "never"},
	{ from: "binary", to: "datetime", degree: "never"},
	{ from: "binary", to: "boolean", degree: "never"},
	{ from: "binary", to: "point", degree: "never"}
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

var mapToKnexTypes = 
{
	"float": "decimal(18, 8)",
	"string": "varchar(2048)",
	"boolean": "bit(1)",
	"text": "text",
	"binary": "blob",
	"datetime": "datetime",
	"date": "date",
	"point": "point"
};

function renameFields(schema){
	var newSchema = _.map(schema, function(table){
		return { 
			name: table.name, 
			fields: _.object(_.map(_.pairs(table.fields), function(p) {
				if (p[1].rename){
					return [p[1].rename, _.omit(p[1], 'rename')];
				}
				else{
					return p;
				}
			}))
		}
	});
	var statements = [];
	_.each(schema, function(jsonTable){
		var tableName = jsonTable.dbName ? jsonTable.dbName : jsonTable.name;	
		_.each(jsonTable.fields, function(value, key){
			if (value.rename){			
				var statement = "ALTER TABLE " + tableName + " CHANGE " + key + " " + value.rename + " " + mapToKnexTypes[value.type];
				statements.push(statement);
			}
		});
	});
	return({
		schema: newSchema,
		statements: statements
	});
	
}


/**
 * given a schema with renaming applies the renaming to the given schema
 * @param  {[object]} schemaWithRenaming JSON schema
 * @param  {[object]} schema JSON schema
 * @return {[object]}  renamed new schema
 */
function applyRename(schemaWithRenaming, schema){

	var renamedNewSchema = _.map(schema, function(table){
		var oldTable = _.findWhere(schemaWithRenaming, { name: table.name });
		if (!oldTable){
			return table;
		}
		else{

			return { 
				name: table.name, 
				fields: _.object(_.map(_.pairs(table.fields), function(p) {


					if (oldTable.fields[p[0]] && oldTable.fields[p[0]].rename){
						return [oldTable.fields[p[0]].rename, p[1]];
					}
					else{
						return p;
					}
				}))
			}

		}

	});
	return renamedNewSchema;

}

// var r = transform(
// 	[{
// 		"name": "R",

// 		"fields" : {
// 			"name": {
// 				"type": "string"
// 			},

// 			"dpt": {
// 				"type": "float",
// 				"unique": true,
// 				"required": true
// 			}
// 		}


// 	}], 
// [{
// 		"name": "R",

// 		"fields" : {
// 			"name": {
// 				"type": "string"
// 			},

// 			"dpt": {
// 				"type": "float",
				
// 				"required": true
// 			}
// 		}


// 	}], 



	 // 0);
// var r = transform(

// [
// 	{
// 		"name": "r",
// 		"fields": {
// 			"name": {
// 				"type": "string"
// 			},
// 			"amount": {
// 				"type": "float"
// 			},
// 			"location": {
// 				"type": "point",
// 				"defaultValue": [34.0, 3]
// 			}
// 		}
// 	}
// ]

// , 1);
// console.log("statements");
// console.log(r);
// _.each(r.alter, function(s){
// 	console.log(s + ";");
// });


function transform(oldSchema, newSchema, severity, isSpecialPrimary){

	try{

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

		// generate notifications on dropping tables and columns
	    validity.notifications = {};
	    if (modifications.dropTable.length > 0){
	            validity.notifications["droppedTables"] = modifications.dropTable;
	    }
	    if (modifications.modifiedTables.length > 0){
	            validity.notifications["droppedColumns"] = [];
	            _.each(modifications.modifiedTables, function(m){
	                    _.each(m.dropped, function(d){
	                            validity.notifications["droppedColumns"].push({ table: m.name, column: d });
	                    });
	            });
	    }
		// Construct an array of the required changes between schemes
		var alterStatementsArray = createStatements(oldSchema, newSchema, modifications, isSpecialPrimary);
		
		// remove created at and updated at columns
		alterStatementsArray = _.map(alterStatementsArray, function(s){
			return s.replace(/, `created_at` datetime/g,"").replace(/, `updated_at` datetime/g,"").replace(/;/g, "");
		});

		// describe the order of the database
		var tablesOrder = _.pluck(newSchema, "name");
		var columnsOrder = _.map(newSchema, function(t){
			return _.keys(t.fields);
		});
		var orderStructure = { tables: tablesOrder, columns: _.object(tablesOrder, columnsOrder) };
		
		return _.extend(validity, { alter: alterStatementsArray, order: orderStructure });

	}
	catch(exp){
		return { error: exp };
	}

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
		var uniqueHasChanged = oldRelation.fields[column].unique ? !newRelation.fields[column].unique : newRelation.fields[column].unique;
	
		var defaultHasChanged = oldRelation.fields[column].defaultValue != newRelation.fields[column].defaultValue;
		if (typeHasChanged || requiredHasChanged || defaultHasChanged || uniqueHasChanged){
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

			if (_.has(oldRelation.fields[column], "type") && _.has(newRelation.fields[column], "type")){ 
				// not a modified from/to relationship



				var oldColumnType = oldRelation.fields[column].type;
				var newColumnType = newRelation.fields[column].type;
				if (oldColumnType !=  newColumnType){
					var conformityDegree = validTypeTransform(oldColumnType, newColumnType);
					switch(conformityDegree)
					{
						case "never":
							warnings.push({ kind: columnTypeConflict, object: relationName, column: column, oldType: oldColumnType, newType: newColumnType });
							invalid = escalateValidity(invalid, "never");
						break;

						case "data":
							warnings.push({ kind: columnTypeConflict, object: relationName, column: column, oldType: oldColumnType, newType: newColumnType });
							invalid = escalateValidity(invalid, "data");
						break;

						default:
						break;
					}


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

function getDefaultValueSql(description){
	var sql = description.defaultValue;

	if (_.has(description, "type")){
		switch(description.type){
			case "string":
				break;
			case "text":
				break;
			case "integer":
				break;
			case "float":
				break;
			case "date":
				break;
			case "time":
				break;
			case "datetime":
				break;
			case "boolean":
				if (sql == true || sql == "true"){
					sql = "b'1'";
				}
				else{
					sql = "b'0'";
				}
				break;
			case "binary":
				break;
			default:
				break;
		}
	}
	return sql;
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
						var isCascade = (_.has(value, "cascade") && value.cascade) || !_.has(value, "cascade");
						newRelationships.push({ type: "1:n", oneRelation: r.name, nRelation: nSideRelation.name, oneAttribute: keyOne, nAttribute: key, isCascade: isCascade });
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
function createStatements(oldSchema, newSchema, modifications, isSpecialPrimary){
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
				statements.unshift(statement.toString());	
				statement = knex.schema.dropTableIfExists(r.nRelation + "_" + r.mRelation + "_" + r.nAttribute + "_" + r.mAttribute);
				statements.push(statement.toString());	
			}
			else if (r.type = "1:n" && r.nRelation == t){				
				statements.unshift("alter table " +  r.oneRelation + " drop foreign key " + r.nRelation.toLowerCase() + "_" + r.oneAttribute.toLowerCase() + "_bkname_" + r.nAttribute.toLowerCase());
			}
		});	

	});

	// add tables
	var addedTables = modifications.createTable;
	var relationships = [];
	_.each(addedTables, function(t){
		var statementsRelationships = [];
		var statement = knex.schema.createTable(t, function (table) {
		  if (isSpecialPrimary){
		  	table.collate("utf8_bin");
		  }
		  if (!isSpecialPrimary){
		  	table.increments();
		  }
		  else{
		  	var idColumn = table.uuid('id');
		  	idColumn.unique().primary();	  	
		  }
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
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "text":
			  			var col = table.text(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "integer":
			  			var col = table.integer(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "float":
			  			var col = table.decimal(name, 50, 2);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "date":
			  			var col = table.date(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "time":
			  			var col = table.time(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "datetime":
			  			var col = table.dateTime(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "boolean":
			  			var col = table.specificType(name, mapToKnexTypes['boolean']); 
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "binary":
			  			var col = table.binary(name);
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			}
			  		break;
			  		case "point":
			  			var col = table.specificType(name, "point");
			  			if (description.required){
			  				col.notNullable();
			  			}
			  			if (description.unique){
			  				col.unique();
			  			} 
			  		break;
			  	}
			  	if (!_.isUndefined(description.defaultValue)){
			  		if (description.type == "point"){
			  			col.defaultTo("GeomFromText('POINT(" + description.defaultValue[0] + " " + description.defaultValue[1] + ")')");
			  		}
			  		else if (description.type == "string"){	
			  			col.defaultTo(getDefaultValueSql(description));  
			  		}			  		
			  		else{			
			  			col.defaultTo(getDefaultValueSql(description));  
			  		}
			  		
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
		  		if (isSpecialPrimary){
					var col = table.uuid(name).references("id").inTable(oneManyRelationship.nRelation);
		  			if (_.has(description, "required") && description.required)
		  				col.notNullable();
		  		}
		  		else{
		  			var col = table.integer(name).unsigned().references("id").inTable(oneManyRelationship.nRelation);		  			
		  			if (_.has(description, "required") && description.required){
		  				col.notNullable();		  		
		  				console.log('not nullable');
		  			}
		  		}

		  		if (oneManyRelationship.isCascade){
		  			col.onDelete("cascade").onUpdate("cascade");
		  		}	  		
		  	}
		  });
		    
		});
		var statementString = statement.toString().replace(/('b'0'')/, "b'0'").replace(/('b'1'')/, "b'1'");
		_.each(relationships, function(r){
			var pattern = 'constraint ' + r.oneRelation.toLowerCase() + '_' + r.oneAttribute.toLowerCase() + '_foreign';
			var replacement = "constraint " + r.nRelation.toLowerCase() + "_" + r.oneAttribute.toLowerCase() + "_bkname_" + r.nAttribute;
			statementString = statementString.replace(pattern, replacement);
		});
		var createStatementsArray = statementString.replace("\n", "").split(";");
		_.each(createStatementsArray, function(s){
			if (!_.contains(statements, s)){
				statements.push(s);
			}
		});	
		_.each(statementsRelationships, function(sR){
			var sRArray = sR.replace("\n", "").split(";");
			_.each(sRArray, function(s){
				if (!_.contains(statements, s)){
					statements.push(s);				
				}
			});
		});
	});

	// modify tables
	var modifiedTables = modifications.modifiedTables;
	_.each(modifiedTables, function(m){
		var tableName = m.name;
		var oldTableDescription = _.findWhere(oldSchema, { "name" : m.name });
		
		var tableDescription = _.first(_.where(newSchema, { name: tableName }));
		var statement = knex.schema.table(oldTableDescription.dbName ? oldTableDescription.dbName : tableName,function(table){
            
			// drop columns
			_.each(m.dropped, function(d){

				// nothing to drop if this is a relationship column
				if (oldTableDescription.fields[d] && !_.has(oldTableDescription.fields[d], "collection")){
					// remove foreign key constraints on column before removing column
					if (_.has(oldTableDescription.fields[d], "object")){
						var statementString = "alter table " + tableName + " drop foreign key " + tableName.toLowerCase() + "_" + d.toLowerCase() +  "_foreign";
						var correspondingOneRelationship = _.findWhere(oldRelationships, { oneRelation: tableName, oneAttribute: d });
						var pattern = tableName.toLowerCase() + '_' + d.toLowerCase() + '_foreign';
						var replacement = oldTableDescription.fields[d].object  + "_" + d.toLowerCase() + "_bkname_" + correspondingOneRelationship.nAttribute;
						statementString = statementString.replace(pattern, replacement);
						if (!_.contains(statements, statementString)){
							statements.push(statementString);
						}	
					}
					var columnDescription = oldTableDescription.fields[d];
					var dbColumnName = columnDescription.dbName? columnDescription.dbName : d;
					table.dropColumn(dbColumnName);
				}

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
							else {
								col.nullable();
							}
				  			if (description.unique){
				  				col.unique();
				  			}
							break;
				  		case "text":
				  			var col = table.text(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
				  			if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "integer":
				  			var col = table.integer(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "float":
				  			var col = table.decimal(d, 50, 8);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "date":
							var col = table.date(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "time":
							var col = table.time(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "datetime":
							var col = table.dateTime(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "boolean":
							var col = table.specificType(d, mapToKnexTypes['boolean']); 
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
				  		case "binary":
							var col = table.text(d);
							if (description.required){
								col.notNullable();
							}
							else {
								col.nullable();
							}
							if (description.unique){
			  					col.unique();
			  				}
							break;
						case "point":
				  			var col = table.specificType(name, "point");
				  			if (description.required){
				  				col.notNullable();
				  			}
				  			else {
								col.nullable();
							}
				  			if (description.unique){
				  				col.unique();
				  			} 
				  			break;

				  	}
				  	if (!_.isUndefined(description.defaultValue)){
			  			col.defaultTo(getDefaultValueSql(description)); 
			  		}
				}
				else if (description.object){ // 1 side of 1:n relationship					
			  		var searchPattern = { oneRelation: tableName, oneAttribute: name };
			  		
			  		var oneManyRelationship = _.findWhere(newRelationships, searchPattern);
			  		var alreadyCreatedRelationship = _.findWhere(relationships, searchPattern);
			  		
			  		if (oneManyRelationship && !alreadyCreatedRelationship){


			  			relationships.push(oneManyRelationship);
				  		//var col = table.integer("fk_" + t + "_" + oneManyRelationship.nRelation + "_bkname_" + name);
						// var col = table.integer(name);
						// col.unsigned();
				  		// col.references("id").inTable(oneManyRelationship.nRelation);
				  		if (isSpecialPrimary){
				  			var col = table.uuid(name).references("id").inTable(oneManyRelationship.nRelation);
				  			if (_.has(description, "required") && description.required)
		  						col.notNullable();
				  		}
				  		else{
				  			var col = table.integer(name).unsigned().references("id").inTable(oneManyRelationship.nRelation);				  			
				  			if (_.has(description, "required") && description.required)
		  						col.notNullable();				  		}
				  		if (oneManyRelationship.isCascade){
				  			col.onDelete("cascade").onUpdate("cascade");
				  		}	

			  		}
			  		  		
			  	
				}		
			});	
		});
		var sArray = statement.toString().replace(/('b'0'')/, "b'0'").replace(/('b'1'')/, "b'1'").replace(";", "").split("\n");
		_.each(sArray, function(a){
			if(a != ""){
			    var statementString = a.toString();
			    _.each(relationships, function(r){
					statementString = statementString.replace('constraint ' + r.oneRelation + '_' + r.oneAttribute + '_foreign', "constraint " + r.nRelation + "_" + r.oneAttribute + "_bkname_" + r.nAttribute);
				});
				if (!_.contains(statements, statementString)){
					statements.push(statementString);
				}
			    
			}
		});

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
			var dbColumnName = newAttributeDescription.dbName? newAttributeDescription.dbName : d;
			var oldTableDescription = _.findWhere(oldSchema, { "name" : tableName });
		
			
			var oldAttributeDescription = oldTableDescription.fields[d];

			if (_.has(oldAttributeDescription, "type") && _.has(newAttributeDescription, "type")){

				var typeHasChanged = oldAttributeDescription.type != newAttributeDescription.type;
				var requiredHasChanged =  oldAttributeDescription.required ? !newAttributeDescription.required : newAttributeDescription.required;
				var uniqueHasChanged = oldAttributeDescription.unique ? !newAttributeDescription.unique : newAttributeDescription.unique;		
				var defaultHasChanged = oldAttributeDescription.defaultValue != newAttributeDescription.defaultValue;


				if (typeHasChanged || requiredHasChanged || defaultHasChanged){
					var typeClause = "alter table " + tableName + " modify " + dbColumnName + " " + mapToKnexTypes[newAttributeDescription.type];
					var requiredClause = newAttributeDescription.required ? " not null " : " null ";
					var defaultClause = !_.isUndefined(newAttributeDescription.defaultValue) ?  " default '" + getDefaultValueSql(newAttributeDescription) + "'" : " ";
					var statement = typeClause + requiredClause + defaultClause;
					statements.push(statement);
				}

				if (uniqueHasChanged){
					if (oldAttributeDescription.unique && !newAttributeDescription.unique){
						var uniqueStatement = "alter table " + tableName + " drop index " + tableName.toLowerCase() + "_" + d + "_unique";
						statements.push(uniqueStatement);

					}
					else if (!oldAttributeDescription.unique && newAttributeDescription.unique){
						var uniqueStatement = "alter table " + tableName + " add unique " + tableName.toLowerCase() + "_" + d + "_unique(" + dbColumnName + ")";
						statements.push(uniqueStatement);
					}
				}

			}
			else if (_.has(newAttributeDescription, "object")){
			
				var searchPattern = { oneRelation: tableName, oneAttribute: d };
		  		
		  		var oneManyRelationship = _.findWhere(newRelationships, searchPattern);
		  		var alreadyCreatedRelationship = _.findWhere(relationships, searchPattern);
		  		
		  		if (oneManyRelationship && !alreadyCreatedRelationship){


		  			relationships.push(oneManyRelationship);
			  		//var col = table.integer("fk_" + t + "_" + oneManyRelationship.nRelation + "_bkname_" + name);
					// var col = table.integer(name);
					// col.unsigned();
			  		// col.references("id").inTable(oneManyRelationship.nRelation);
			  		
			  		var relationshipStatement = knex.schema.table(tableName, function (table) {
				  		if (isSpecialPrimary){
				  			var col = table.uuid(d).references("id").inTable(oneManyRelationship.nRelation);
				  			if (_.has(description, "required") && description.required)
		  						col.notNullable();
				  		}
				  		else{
				  			var col = table.integer(d).unsigned().references("id").inTable(oneManyRelationship.nRelation);				  			
				  			if (_.has(description, "required") && description.required)
		  						col.notNullable();
				  		}
				  		if (oneManyRelationship.isCascade){
				  			col.onDelete("cascade").onUpdate("cascade");
				  		}	
					  
					});
			  		statements.push(relationshipStatement.toString());

		  		}

			}
			
			
		});
	});

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
					  if (isSpecialPrimary){
					  	var colN = table.uuid("fk_" + nr.nRelation);
					  }
					  else{
					  	var colN = table.integer("fk_" + nr.nRelation);
					  	colN.unsigned();					  	
					  }
				  	  colN.references("id").inTable(nr.nRelation).onDelete("cascade").onUpdate("cascade");
				  	  if (isSpecialPrimary){
				  	  	var colM = table.uuid("fk_" + nr.mRelation);
				  	  }
				  	  else{
				  	    var colM = table.integer("fk_" + nr.mRelation);
				  	    colM.unsigned();				  	  	
				  	  }
				  	  colM.references("id").inTable(nr.mRelation).onDelete("cascade").onUpdate("cascade");
				  	  if (_.has(description, "required") && description.required)
		  				col.notNullable();
					});
					var s = statement.toString();
					if (!_.contains(statements, s)){
						statements.push(s);				
					}

    			}
    		}
    	}
    });

	var statementClasses = _.partition(statements, function(s){
		return s.indexOf("constraint") == -1 || s.indexOf("drop foreign key") != -1;
	});
	var statements = statementClasses[0];
	_.each(statementClasses[1], function(s){
		statements.push(s);
	});
    return statements;

}