/**
 * Created by Dell on 2/2/2016.
 */


var self = this;

function PointerConverter(schema) {
    self.schema = schema;
}

PointerConverter.prototype = (function() {
    // Private code here
    var getUpdateStatementForSinglePointer = function(className, property, errorCallback) {
        return "update `" + className + "` set `" + property + "` = @pointer where objectId = '@objectId'";
    };

    return {

        constructor:PointerConverter,

        getUpdateStatementsForAllPointer:function(className, jsonFromParse, errorCallback) {
            var updateStatements = [];
            var objectId = jsonFromParse.objectId;

            for (var property in jsonFromParse) {
                try {
                    if (json.hasOwnProperty(property)) {
                        var propertyType = self.schema.getPropertyType(className, property, errorCallback);
                        switch (propertyType) {
                            case "Pointer":
                                var pointer = "null";
                                if (json[property] && json[property].objectId) pointer = "'" + json[property].objectId + "'";
                                var sql = getUpdateStatementForSinglePointer(className, property, errorCallback).replace("@pointer", pointer).replace("@objectId", objectId);
                                updateStatements.push(sql);
                                break;

                            default:
                                break;
                        }
                    }
                }
                catch(err){
                    errorCallback({
                        js: "PointerConverter",
                        func: "getUpdateStatementsForAllPointer",
                        className: className,
                        objectId: json.objectId,
                        column: property,
                        message: "Parse to MySQL transformation error",
                        internalError: err
                    });
                }

                return updateStatements;
            }
        }

    };
})();

module.exports = PointerConverter;



