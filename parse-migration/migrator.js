/**
 * Created by Dell on 2/2/2016.
 */
var ParseSchema = require('./parse-schema');
var ClassJsonConverter = require('./class-json-converter');
var PointerConverter = require('./pointer-converter');
var RelationConverter = require('./relation-converter');
var BulkRunner = require('./bulk-runner');
var Streamer = require('./streamer');
var Report = require('./report');
var logger = require('./logging/logger').getLogger('Migrator');
var async = require('async');
// test
var testSchema = require('./test/schema.json');
var testConnection = require('./test/connection.json');
var Cleaner = require('./test/cleaner');
var StatusBl = require('./statusBl');
//

var connectionRetreiver = require('../get_connection_info');

// STEPS //
var InsertClassStep = require('./steps/insertClassStep');
var UpdatePointerStep = require('./steps/updatePointerStep');
var UpdateRelationStep = require('./steps/updateRelationStep');
//



function Migrator() {
}

Migrator.prototype = (function () {
    // Private code here
    var current = this;


    function runInner(appName, connectionInfo, datalink, strSchema, statusBl, finishedCallback, currentStatus) {
        var schema = JSON.parse(strSchema).results;

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

        // report errors and statistics
        var report = new Report("./" + appName + ".json");

        // insert data of all classes without Relations and Pointers
        async.series([
            function (callback) {
                logger.info('start insertClass');
                var insertStep = new InsertClassStep(appName,statusBl, bulkRunner, classJsonConverter, streamer, report);
                // iterate on each class in the schema
                async.eachSeries(schema, function (sc, callback2) {
                        // get the class
                        var className = sc.className;

                        // get the file equivalent to this class
                        var fileName = className + ".json";

                        // insert the file to equivalent MySQL table
                        insertStep.insertClass(datalink, fileName,className, callback2);
                    }, function () {
                        logger.info('finish step insertClass');
                        callback()
                    }
                );
            },
            function (callback) {
                logger.info('start Pointer step');
                var updatePointerStep = new UpdatePointerStep();
                // update data of all classes Pointers
                async.eachSeries(schema, function (sc, callback2) {

                    var className = sc.className;
                    var fileName = className + ".json";
                    updatePointerStep.updatePointers(streamer, report, datalink, fileName, pointerConverter, className, bulkRunner, callback2);
                }, function () {
                    logger.info('finish step pointer');
                    callback()
                });
            },
            function (callback) {
                logger.info('start updateRelations step');
                var updateRelationStep = new UpdateRelationStep();
                // update data of all classes Relations
                async.eachSeries(schema, function (sc, callback2) {
                    var className = sc.className;
                    updateRelationStep.updateRelations(streamer, report, datalink, relationConverter, className, parseSchema, bulkRunner, callback2);
                }, function () {
                    logger.info('finish step updateRelations');
                    callback()
                });
            },
            function (callback) {

                finishedCallback();
                callback();
                logger.info('finished migration');

            }]);
    };

    return {

        constructor: Migrator,

        run: function (job, directory, statusBl, finishedCallback) {
            var self = this;
            self.directory = directory;
            self.currentJob = job;
            self.statusBl = statusBl;

            var caller = finishedCallback;

            connectionRetreiver.getConnectionInfoSimple(job.appToken, job.appName, function (err, result) {
                var job = self.currentJob;
                runInner(job.appName, result, self.directory, job.parseSchema, self.statusBl, caller);
            });
        },

        runTest: function (appName, connectionInfo, datalink, schema, statusBl, finishedCallback, currentStatus) {
            runInner(appName, connectionInfo, datalink, schema, statusBl, finishedCallback, currentStatus);
        }

    };
})();

module.exports = Migrator;

function test() {

    var cleaner = new Cleaner(testConnection);
    var migrator = new Migrator();
    var strSchema = JSON.stringify(testSchema);
    // perform database cleanup to initiate all the tables. only needed in the test
    cleaner.clean(testSchema, function (error) {
            console.log(error);
        }, function () {

        }, function () {
            migrator.run("aaa", testConnection, "./test/data/", strSchema, function () {
                logger.info('finishedCallback');

            });
        }
    );
}

function test2() {

    var cleaner = new Cleaner(testConnection);
    var migrator = new Migrator();
    var strSchema = JSON.stringify(testSchema);
    // perform database cleanup to initiate all the tables. only needed in the test
    cleaner.clean(testSchema.results, function (error) {
            console.log(error);
        }, function () {

        }, function () {
            var statusBl = new StatusBl();
            statusBl.connect().then(function() {
                migrator.runTest("aaa", testConnection, "./test/data/",
                    strSchema, statusBl, function () {
                        logger.info('finishedCallback');
                    })
            })
        }
    );
}
test2();
//test();