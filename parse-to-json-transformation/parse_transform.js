module.exports.transformer = transform;

var _ = require('lodash');

var simpleTypesMapping = {
	'Boolean': 'boolean',
    'String': 'string',
    'Number': 'float',
    'Date': 'datetime',
    'GeoPoint': 'point',
    'File': 'string'
};

var	oneManyRelationships = {};

function transform(schema){
	var objects = schema.results;

	var primaryObjects = _.filter(objects, function(o){
		//return o.className != '_User' && o.className != '_Role' && !_.startsWith(o.className, '_Join');
		return !_.startsWith(o.className, '_Join');
	});

	// find 1:n relationship - 
	// collect the many side for a pointer type in order to generate the one side later
	// collect the one side for a relation type in order to generate the many side later
	oneManyRelationships = {};
	manyOneRelationships = {};
	_.each(primaryObjects, function(o){
		_.each(o.fields, function(columnDescription, columnName){
			if (columnDescription.type == 'Pointer'){ // many side
				var manyObject = o.className;
				var oneObject = columnDescription.targetClass;
				var manyColumn = columnName;
				if (!_.has(oneManyRelationships, oneObject)){
					oneManyRelationships[oneObject] = [];
				}
				oneManyRelationships[oneObject].push({ object: manyObject, column: manyColumn });
			}
			else if (columnDescription.type == 'Relation'){ // one side
				var oneObject = o.className
				var manyObject = columnDescription.targetClass;
				var oneColumn = columnName;
				if (!_.has(manyOneRelationships, manyObject)){
					manyOneRelationships[manyObject] = [];
				}

				manyOneRelationships[manyObject].push({ object: oneObject, column: oneColumn });
			}
		});
	});

	return _.map(primaryObjects, transformPrimaryObject);
}

function transformPrimaryObject(o){
	var fields = {};



	_.each(o.fields, function(columnDescription, columnName){
		// skip special fields
		if (_.includes(['ACL'], columnName)){
			
		}
		else if (_.has(simpleTypesMapping, columnDescription.type)){
			// ���� ��� �����
			if(columnName == "objectId"){
				columnName = "parseObjectId"
			}

			fields[columnName] = { type: simpleTypesMapping[columnDescription.type] };
		}
		else if (columnDescription.type == 'Pointer'){
			fields[columnName] = {
				'object': columnDescription.targetClass
			};
		}
		else if (columnDescription.type == 'Relation'){
			fields[columnName] = {
				'collection': columnDescription.targetClass,
				'via': o.className  + "_" + columnName
			};
		}
	});

	// generate one side of many-to-one relationship
	if (_.has(oneManyRelationships, o.className)){
		_.each(oneManyRelationships[o.className], function(oneAttribute){
			var newColumnName = oneAttribute.object + "_" + oneAttribute.column;
			fields[newColumnName] = {
				collection: oneAttribute.object,
				via: oneAttribute.column
			};
		});
	}

	// generate many side of many-to-one relationship
	if (_.has(manyOneRelationships, o.className)){
		_.each(manyOneRelationships[o.className], function(manyAttribute){
			var newColumnName = manyAttribute.object + "_" + manyAttribute.column;
			fields[newColumnName] = {
				object: manyAttribute.object
			};
		});
	}

	return {
		name: o.className,
		fields: fields
	};
}

// var r = transform(
//
// 	{
//   "results": [
//     {
//       "className": "_User",
//       "fields": {
//         "ACL": {
//           "type": "ACL"
//         },
//         "authData": {
//           "type": "Object"
//         },
//         "createdAt": {
//           "type": "Date"
//         },
//         "email": {
//           "type": "String"
//         },
//         "emailVerified": {
//           "type": "Boolean"
//         },
//         "objectId": {
//           "type": "String"
//         },
//         "password": {
//           "type": "String"
//         },
//         "updatedAt": {
//           "type": "Date"
//         },
//         "username": {
//           "type": "String"
//         }
//       }
//     },
//     {
//       "className": "_Role",
//       "fields": {
//         "ACL": {
//           "type": "ACL"
//         },
//         "createdAt": {
//           "type": "Date"
//         },
//         "name": {
//           "type": "String"
//         },
//         "objectId": {
//           "type": "String"
//         },
//         "roles": {
//           "type": "Relation",
//           "targetClass": "_Role"
//         },
//         "updatedAt": {
//           "type": "Date"
//         },
//         "users": {
//           "type": "Relation",
//           "targetClass": "_User"
//         }
//       }
//     },
//     {
//       "className": "post",
//       "fields": {
//         "ACL": {
//           "type": "ACL"
//         },
//         "content": {
//           "type": "String"
//         },
//         "createdAt": {
//           "type": "Date"
//         },
//         "date": {
//           "type": "Date"
//         },
//         "location": {
//           "type": "GeoPoint"
//         },
//         "myComments": {
//           "type": "Relation",
//           "targetClass": "comment"
//         },
//         "obj": {
//           "type": "Object"
//         },
//         "objectId": {
//           "type": "String"
//         },
//         "photo": {
//           "type": "File"
//         },
//         "tags": {
//           "type": "Array"
//         },
//         "title": {
//           "type": "String"
//         },
//         "updatedAt": {
//           "type": "Date"
//         }
//       }
//     },
//     {
//       "className": "comment",
//       "fields": {
//         "ACL": {
//           "type": "ACL"
//         },
//         "content": {
//           "type": "String"
//         },
//         "createdAt": {
//           "type": "Date"
//         },
//         "objectId": {
//           "type": "String"
//         },
//         "source": {
//           "type": "Pointer",
//           "targetClass": "post"
//         },
//         "updatedAt": {
//           "type": "Date"
//         }
//       }
//     }
//   ]
// }
//
// );
//
//var objects = [];
// _.each(r, function(s){
// 	  //console.log(s);
//   objects.push(s);
// });
//var bkSchema = JSON.parse(JSON.stringify(objects));
//console.log(JSON.stringify(bkSchema));
