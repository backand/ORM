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
//var testSchema = require('./test/schema.json');
//var testConnection = require('./test/connection.json');
//var Cleaner = require('./test/cleaner');
var StatusBl = require('./statusBl');
//

var connectionRetreiver = require('../get_connection_info');

// STEPS //
var InsertClassStep = require('./steps/insertClassStep');
var UpdatePointerStep = require('./steps/updatePointerStep');
var UpdateRelationStep = require('./steps/updateRelationStep');
var UpdateUsersStep = require('./steps/UpdateUsersStep');

//



function Migrator() {
}

Migrator.prototype = (function () {
    // Private code here
    var current = this;


    function runInner(clientToken, appName, connectionInfo, datalink, strSchema, statusBl, report, finishedCallback,  currentStatus) {
        var schema = JSON.parse(strSchema).results;

        // a schema wrapper with helping functions
        var parseSchema = new ParseSchema(schema);
        parseSchema.adjustNames();

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
        async.series([
            function (callback) {
                logger.info('start insertClass');
                //var insertStep = new InsertClassStep(appName,statusBl, bulkRunner, classJsonConverter, streamer, report);
                // iterate on each class in the schema
                async.eachSeries(schema, function (sc, callback2) {
                        // get the class
                        var className = sc.className;
                        var originalName = sc.originalName;
                        // get the file equivalent to this class
                        var fileName = originalName + ".json";

                        // insert the file to equivalent MySQL table
                        new InsertClassStep(appName,statusBl, bulkRunner, classJsonConverter, streamer, report).insertClass(datalink, fileName,className, callback2);
                    }, function () {
                        logger.info('finish step insertClass');
                        callback()
                        return;
                    }
                );
            },
            function (callback) {
                logger.info('start Pointer step');
                //var updatePointerStep = new UpdatePointerStep();
                // update data of all classes Pointers
                async.eachSeries(schema, function (sc, callback2) {
                    var className = sc.className;
                    var originalName = sc.originalName;
                    logger.info('Pointer inner step: ' + sc.className);

                    if(!parseSchema.classHasPointers(sc.className)){
                        logger.info('not any pointer in class ' + sc.className)
                        callback2();
                        return;
                    }

                    var fileName = originalName + ".json";
                    new UpdatePointerStep().updatePointers(streamer, report, datalink, fileName, pointerConverter,
                        className, bulkRunner, callback2);
                }, function () {
                    logger.info('finish step pointer');
                    callback()
                    return;
                });
            },
            function (callback) {
                logger.info('start updateRelations step');
                var updateRelationStep = new UpdateRelationStep();
                // update data of all classes Relations
                async.eachSeries(schema, function (sc, callback2) {
                    var className = sc.className;
                    new UpdateRelationStep().updateRelations(streamer, report, datalink, relationConverter,
                        className, parseSchema, bulkRunner, callback2);
                }, function () {
                    logger.info('finish step updateRelations');
                    callback()
                    return;
                });
            },
            function (callback) {
                logger.info('start update users');
                var updateUsersStep = new UpdateUsersStep(statusBl,  clientToken);
                // update users
                updateUsersStep.run(bulkRunner, function(){
                    logger.info('finish step updateUsers');
                    callback();
                    return;
                });
            },
            function (callback) {
                report.log('success finsih migration for appName ' + appName);
                report.write();
                finishedCallback();
                logger.info('finished migration');
                callback();
                return;

            }]);
    };

    return {

        constructor: Migrator,

        run: function (job, directory, statusBl, report,  finishedCallback) {
            var self = this;
            self.directory = directory;
            self.currentJob = job;
            self.statusBl = statusBl;
            self.report = report;
            var caller = finishedCallback;

            connectionRetreiver.getConnectionInfoSimple(job.appToken, job.appName, function (err, result) {
                var job = self.currentJob;
                runInner(job.appToken, job.appName, result, self.directory, job.parseSchema, self.statusBl, self.report, caller);
            });
        },

        runTest: function (appName, connectionInfo, datalink, schema, statusBl, finishedCallback, currentStatus) {
            runInner(undefined, appName, connectionInfo, datalink, schema, statusBl,null,  finishedCallback, currentStatus);
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
           logger.error(error.message);
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
            logger.error(error.message)
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
//test2();
//test();