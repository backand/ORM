/**
 * Created by Dell on 2/9/2016.
 */

var async = require('async');
var logger = require('../logging/logger').getLogger('updateRelation');
const BULK_SIZE = 1;

function updateRelationStep () {

}

updateRelationStep.prototype.updateRelations = function(streamer, report, datalink, converter, className, parseSchema, bulkRunner, finishAllCallback) {
    var current = this;
    var relations = parseSchema.getClassRelations(className, function (error) {
        // error report
    });

    async.eachSeries(relations, function (rel, callback2) {
        var relationName = rel;
        var fileName = "_Join_" + relationName + "_" + className + '.json';
        logger.info('start ' + fileName)
        current.updateRelation(streamer, report, datalink, fileName, converter, className, relationName, bulkRunner, callback2);
    }, finishAllCallback);
};

updateRelationStep.prototype.updateRelationInner = function(sql , bulkRunner, callback) {
    var current = this;

    if(sql && sql.length > 0) {
        var fullSql = sql.join(";") + ";";
        bulkRunner.update(fullSql, function (error) {
                // error report
                logger.error(sql + " " + JSON.stringify(error));
            },
            function () {
                logger.info('success finish updateRelationInner ' + sql);
                callback();
            });
    } else {
        callback();
    }
}

updateRelationStep.prototype.updateRelation = function(streamer, report, datalink, fileName, converter, className, relationName, bulkRunner, callback) {
    var current = this;
    current.updateRelationBulk = [];
    current.report = report;

    function updateRelationOnFinish(){
        current.updateRelationInner(current.updateRelationBulk,bulkRunner, callback);
    };

    function updateRelationOnData(data, cb) {

        var sql = "";
        var json = data;
        var updateStatements = converter.getUpdateStatementsForRelation(className, relationName, json, function (error) {
            // error report
        })

        sql = updateStatements;
        logger.info(sql);

        if (!sql) {
            callback();
        }
        else {

            current.updateRelationBulk.push(sql);

            if(current.updateRelationBulk.length === BULK_SIZE){
                current.updateRelationInner(current.updateRelationBulk,bulkRunner, cb);
            }
            else{
                cb();
            }

        }
    };

    streamer.getData(datalink, fileName, updateRelationOnData, updateRelationOnFinish);
};


module.exports = updateRelationStep;

