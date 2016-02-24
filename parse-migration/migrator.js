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


var insertClassStep = function (broker, callback) {
    logger.info('start insertClass');
    //var insertStep = new InsertClassStep(appName,statusBl, bulkRunner, classJsonConverter, streamer, report);
    // iterate on each class in the schema
    // check step status

    //jobStatus.started = true;
    async.eachSeries(broker.schema, function (sc, callback2) {
        // get the class
        var className = sc.className;
        var originalName = sc.originalName;

        // get the file equivalent to this class
        var fileName = originalName + ".json";

        var objectId = undefined;

        if (broker.jobStatus && broker.jobStatus.fileName === className && broker.jobStatus.objectId) {
            objectId = broker.jobStatus.objectId;
            broker.jobStatus = undefined;
        }

        if (!broker.jobStatus) {
            // insert the file to equivalent MySQL table
            new InsertClassStep(objectId, broker.appName, broker.statusBl, broker.bulkRunner, broker.classJsonConverter, broker.streamer, broker.report)
                .insertClass(broker.datalink, fileName, className, callback2);
        }
        else{
            callback2();
        }
        //}


    }, function () {
        logger.info('finish step insertClass');
        callback();
    });


};

var updatePointerStep = function (broker, callback) {
    logger.info('start Pointer step');

    // update data of all classes Pointers
    async.eachSeries(broker.schema, function (sc, callback2) {
        var className = sc.className;
        var originalName = sc.originalName;
        logger.info('Pointer inner step: ' + sc.className);

        if (!broker.parseSchema.classHasPointers(sc.className)) {
            logger.info('not any pointer in class ' + sc.className);
            callback2();
            return;
        }

        var objectId;

        if (broker.jobStatus && broker.jobStatus.fileName === className && broker.jobStatus.objectId) {
            objectId = broker.jobStatus.objectId;
            broker.jobStatus = undefined;
        }

        if (!broker.jobStatus) {
            var fileName = originalName + ".json";
            new UpdatePointerStep().updatePointers(objectId, broker.appName, broker.statusBl, broker.streamer, broker.report, broker.datalink, fileName, broker.pointerConverter,
                className, broker.bulkRunner, callback2);
        }
        else{
            callback2();
        }
    }, function () {
        logger.info('finish step pointer');
        callback();
    });
};

var updateRelationStep = function (broker, callback) {
    logger.info('start updateRelations step');
    var updateRelationStep = new UpdateRelationStep();
    // update data of all classes Relations
    async.eachSeries(broker.schema, function (sc, callback2) {
        var className = sc.className;
        new UpdateRelationStep().updateRelations(broker.streamer, broker.report, broker.datalink, broker.relationConverter,
            className, broker.parseSchema, broker.bulkRunner, callback2);
    }, function () {
        logger.info('finish step updateRelations');
        callback();
    });
};

var updateUsersStep = function (broker, callback) {
    logger.info('start update users');
    var updateUsersStep = new UpdateUsersStep(broker.statusBl, broker.clientToken);
    // update users
    updateUsersStep.run(broker.bulkRunner, function () {
        logger.info('finish step updateUsers');
        callback();
    });
};

var finalStep = function (context, callback) {
    context.report.log('success finsih migration for appName ' + context.appName);
    context.report.write();
    context.finishedCallback();
    logger.info('finished migration');
    callback();

};

function getMigrationSteps(jobStatus, context) {
    var arr = [
        insertClassStep.bind(null, context),
        updatePointerStep.bind(null, context),
        updateRelationStep.bind(null, context),
        updateUsersStep.bind(null, context),
        finalStep.bind(null, context)
    ];

    if (jobStatus) {
        switch (jobStatus.statusName) {
            case 'updatePointer' :
                arr.splice(0, 1);
                break;
            case 'updateRelation' :
                arr.splice(0, 2);
                break;
            case 'updateUsers' :
                arr.splice(0, 3);
                break;
        }
    }

    return arr;
}

function Migrator() {
}

Migrator.prototype = (function () {
    // Private code here
    var current = this;


    function runInner(jobStatus, clientToken, appName, connectionInfo, datalink, strSchema, statusBl, report, finishedCallback) {
        console.log("report is ", report);

        var schema = JSON.parse(strSchema).results;
        var parseSchema = new ParseSchema(schema);

        var context = {
            appName: appName,

            clientToken: clientToken,

            schema: schema,

            parseSchema: parseSchema,

            // converts json to SQL Insert commands and parameters
            classJsonConverter: new ClassJsonConverter(parseSchema),

            // converts Parse Pointers to SQL Update commands
            pointerConverter: new PointerConverter(parseSchema),

            // converts Parse Relations to SQL Update commands
            relationConverter: new RelationConverter(parseSchema),

            // run MySQL bulk SQL commands
            bulkRunner: new BulkRunner(connectionInfo),

            // read large json files
            streamer: new Streamer(),

            jobStatus: jobStatus,

            datalink: datalink,

            report: report,

            statusBl: statusBl,

            finishedCallback: finishedCallback

        };

        var arr = getMigrationSteps(jobStatus, context);
        // insert data of all classes without Relations and Pointers
        async.series(arr);
    }

    return {
        constructor: Migrator,

        // for test purpose
        getSteps: getMigrationSteps,

        run: function (job, directory, statusBl, report, finishedCallback) {
            var self = this;
            self.directory = directory;
            self.currentJob = job;
            self.statusBl = statusBl;
            self.report = report;
            var caller = finishedCallback;

            connectionRetreiver.getConnectionInfoSimple(job.appToken, job.appName, function (err, result) {
                var job = self.currentJob;
                runInner(job.resumeStatus, job.appToken, job.appName, result, self.directory, job.parseSchema, self.statusBl, self.report, caller);
            });
        },

        runTest: function (undefined, undefined, appName, connectionInfo, datalink, schema, statusBl, finishedCallback, currentStatus) {
            runInner(undefined, appName, connectionInfo, datalink, schema, statusBl, null, finishedCallback, currentStatus);
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
            statusBl.connect().then(function () {
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