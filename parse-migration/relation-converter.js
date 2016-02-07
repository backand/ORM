/**
 * Created by Dell on 2/4/2016.
 */
/**
 * Created by Dell on 2/2/2016.
 */


var self = this;

function RelationConverter(schema) {
    self.schema = schema;
}

RelationConverter.prototype = (function() {
    // Private code here
    var getUpdateStatementForRelation = function(className, relationName, errorCallback) {
        return "update `" + className + "` set `" + relationName + "Join` = @owningId where objectId = '@objectId'";
    };

    return {

        constructor:RelationConverter,

        getUpdateStatementsForRelation:function(className, relationName, jsonFromParse, errorCallback) {
            var updateStatements = [];
            var owningId = jsonFromParse.owningId;
            var relatedId = jsonFromParse.relatedId;
            var sql = getUpdateStatementForRelation(className, property, errorCallback);

            return sql.replace("@owningId", owningId).replace("@objectId", relatedId);
        }

    };
})();

module.exports = RelationConverter;



