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
    var getUpdateStatementForRelation = function(childClassName, parentClassName, relationName, errorCallback) {
        return "update `" + childClassName + "` set `" + parentClassName + "_" + relationName + "` = '@owningId' where id = '@objectId'";
    };

    return {

        constructor:RelationConverter,

        getUpdateStatementsForRelation:function(className, relationName, jsonFromParse, errorCallback) {
            console.log(className, relationName, jsonFromParse)
            var updateStatements = [];
            var owningId = self.schema.toUUid(jsonFromParse.owningId);
            var relatedId = self.schema.toUUid(jsonFromParse.relatedId);
            var sql = getUpdateStatementForRelation(self.schema.getClassRelationTargetClass(className, relationName), className, relationName, errorCallback);

            return sql.replace("@owningId", owningId).replace("@objectId", relatedId);
        }

    };
})();

module.exports = RelationConverter;



