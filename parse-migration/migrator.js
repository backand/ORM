/**
 * Created by Dell on 2/2/2016.
 */
var ParseSchema = require('./parse-schema');
var ClassJsonConverter = require('./class-json-converter');
var PointerConverter = require('./pointer-converter');
var RelationConverter = require('./relation-converter');
var BulkRunner = require('./bulk-runner');
var Streamer = require('./streamer');
var logger = require('./logging/logger').getLogger('Migrator');
var async = require('async');
// test
var testSchema = require('./test/schema.json').results;
var testConnection = require('./test/connection.json');
var Cleaner = require('./test/cleaner');


function Migrator() {
}

Migrator.prototype = (function () {
    // Private code here

    function insertClass(streamer, datalink, fileName, converter, className, bulkRunner, callback) {
        logger.info('start insert class ' + className);
        streamer.getData(datalink, fileName, function (fileName, data) {
            logger.info('start getData ' + fileName);

            if (!data) {
                callback();
            }

            else {
                var sql = converter.getInsertStatement(className, function (error) {
                    // error report
                })

                var valuesForBulkInserts = [];

                // read each Parse class and insert it into a table
                for (var i in data) {
                    var json = data[i];
                    var valuesToInsert = converter.getValuesToInsertStatement(className, json, function (error) {
                        // error report
                    })

                    valuesForBulkInserts.push(valuesToInsert);
                }

                logger.info('bulkRunner insert ' + sql);
                bulkRunner.insert(sql, valuesForBulkInserts, function (error) {
                }, callback);
            }
        });
    };

    function updatePointers(streamer, datalink, fileName, converter, className, bulkRunner, callback) {
        streamer.getData(datalink, fileName, function (fileName, data) {
            var sql = "";
            for (var i in data) {
                var json = data[i];
                var updateStatements = converter.getUpdateStatementsForAllPointer(className, json, function (error) {
                    // error report
                })
                if (!updateStatements || updateStatements.length == 0) {
                    break; // class has no pointers so there is no point to run through its data
                }
                sql = sql + updateStatements.join(";") + ";";
            }

            if (!sql){
                callback();
            }
            else {
                bulkRunner.update(sql, function (error) {
                    // error report

                }, callback);
            }
        });
    };

    function updateRelations(streamer, datalink, converter, className, parseSchema, bulkRunner, callback) {
        var relations = parseSchema.getClassRelations(className, function (error) {
            // error report
        });
        //for (var i in relations) {
        async.eachSeries(relations, function (rel, callback2) {
            var relationName = rel;
            var fileName = "_Join_" + relationName + "_" + className;
            updateRelation(streamer, datalink, fileName, converter, className, relationName, bulkRunner, callback2);
        }, callback );
    };

    function updateRelation(streamer, datalink, fileName, converter, className, relationName, bulkRunner, callback) {
        streamer.getData(datalink, fileName, function (fileName, data) {
            var sql = "";
            for (var i in data) {
                var json = data[i];
                var updateStatements = converter.getUpdateStatementsForRelation(className, relationName, json, function (error) {
                    // error report
                })
                sql = sql + updateStatements + ";";
            }

            if (!sql){
                callback();
            }
            else {
                bulkRunner.update(sql, function (error) {
                    // error report
                }, callback);
            }
        });
    };


    return {

        constructor: Migrator,

        run: function (appName, accessToken, connectionInfo, datalink, schema) {
            // a schema wrapper with helping functions
            var parseSchema = new ParseSchema(schema);

            // converts json to SQL Insert commands and parameters
            var classJsonConverter = new ClassJsonConverter(parseSchema);

            // converts Parse Pointers to SQL Update commands
            var pointerConverter = new PointerConverter(parseSchema);

            // converts Parse Relations to SQL Update commands
            var relationConverter = new RelationConverter(parseSchema);

            // run MySQL bulk SQL commands
            var bulkRunner = new BulkRunner(connectionInfo);

            // read large json files
            var streamer = new Streamer();

            // insert data of all classes without Relations and Pointers
            async.series([function (callback) {
                logger.info('start insertClass');
                // iterate on each class in the schema
                async.eachSeries(schema, function (sc, callback2) {

                    // get the class
                    var className = sc.className;


                    // get the file equivalent to this class
                    var fileName = className + ".json";

                    // insert the file to equivalent MySQL table
                    insertClass(streamer, datalink, fileName,  classJsonConverter, className, bulkRunner, callback2);
                }, function() {
                        logger.info('finish step insertClass');
                    callback()
                }
                );
            },
                function (callback) {
                    logger.info('start Pointer step');
                    // update data of all classes Pointers
                    async.eachSeries(schema, function (sc, callback2) {

                        var className = sc.className;
                        var fileName = className + ".json";
                        updatePointers(streamer, datalink, fileName, pointerConverter, className, bulkRunner, callback2);
                    },function() {
                        logger.info('finish step pointer');
                        callback()
                    });
                },
                function (callback) {
                    logger.info('start updateRelations step');

                    // update data of all classes Relations
                    async.eachSeries(schema, function (sc, callback2) {
                        var className = sc.className;
                        updateRelations(streamer, datalink, relationConverter, className, parseSchema, bulkRunner, callback2);
                    }, function() {
                        logger.info('finish step updateRelations');
                        callback()
                    });
                }]);
        }
    };
})();

function test() {

    var cleaner = new Cleaner(testConnection);
    var migrator = new Migrator();
    // perform database cleanup to initiate all the tables. only needed in the test
    cleaner.clean(testSchema, function (error) {
        console.log(error);
    }, function(){

    }, function() {
            migrator.run("aaa", "", testConnection, "./test/data/", testSchema)
        }
    );


}

test();