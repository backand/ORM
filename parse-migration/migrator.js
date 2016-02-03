/**
 * Created by Dell on 2/2/2016.
 */
var ParseSchema = require('./parse-schema');
var ClassJsonConverter = require('./class-json-converter');
var BulkRunner = require('./bulk-runner');
var Streamer = require('./streamer');

var schemaExample =
    [
        {
            "className": "_User",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "authData": {
                    "type": "Object"
                },
                "createdAt": {
                    "type": "Date"
                },
                "email": {
                    "type": "String"
                },
                "emailVerified": {
                    "type": "Boolean"
                },
                "objectId": {
                    "type": "String"
                },
                "password": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "username": {
                    "type": "String"
                }
            }
        },
        {
            "className": "_Role",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "name": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "roles": {
                    "type": "Relation",
                    "targetClass": "_Role"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "users": {
                    "type": "Relation",
                    "targetClass": "_User"
                }
            }
        },
        {
            "className": "post",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "amount": {
                    "type": "Number"
                },
                "best": {
                    "type": "Pointer",
                    "targetClass": "comment"
                },
                "content": {
                    "type": "String"
                },
                "createdAt": {
                    "type": "Date"
                },
                "date": {
                    "type": "Date"
                },
                "deleted": {
                    "type": "Boolean"
                },
                "location": {
                    "type": "GeoPoint"
                },
                "myComments": {
                    "type": "Relation",
                    "targetClass": "comment"
                },
                "obj": {
                    "type": "Object"
                },
                "objectId": {
                    "type": "String"
                },
                "photo": {
                    "type": "File"
                },
                "tags": {
                    "type": "Array"
                },
                "title": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "comment",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "content": {
                    "type": "String"
                },
                "createdAt": {
                    "type": "Date"
                },
                "objectId": {
                    "type": "String"
                },
                "source": {
                    "type": "Pointer",
                    "targetClass": "post"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        }
    ];

function Migrator() {
}

Migrator.prototype = (function () {
    // Private code here

    return {

        constructor: Migrator,

        run: function (appName, accessToken, connectionInfo, datalink, schema) {
            var parseSchema = new ParseSchema(schema);
            var converter = new ClassJsonConverter(parseSchema);

            var bulkRunner = new BulkRunner(connectionInfo);


            var streamer = new Streamer();

            streamer.getData(datalink, function (className, data) {
                var sql = converter.getInsertStatement(className, function (error) {

                })

                var valuesForBulkInserts = [];
                for (var i in data) {
                    var json = data[i];
                    var valuesToInsert = converter.getValuesToInsertStatement(className, json, function (error) {


                    })

                    valuesForBulkInserts.push(valuesToInsert);
                }

                bulkRunner.insert(sql, valuesForBulkInserts, function (error) {
                });
            });
        }

    };
})();

function test() {
    var migrator = new Migrator();
    var connectionInfo = {
        multipleStatements: true,
        host: "localhost",
        database: "backandapp04newusq4e6hv13",
        user: "root",
        //password: "jay",
        port: 3306
    };

    migrator.run("aaa", "", connectionInfo, "", schemaExample);
}

test();