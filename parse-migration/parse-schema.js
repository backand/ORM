/**
 * Created by Dell on 2/2/2016.
 */
var logger = require('./logging/logger').getLogger('ParseSchema');

var self = this;

function ParseSchema(schema) {
    self.schema = schema;

    self.schemaDictionary = {};

    for (var i in self.schema) {
        var parseClass = self.schema[i];
        self.schemaDictionary[parseClass.className] = parseClass;
    };
}

ParseSchema.prototype = (function() {
    // Private code here


    return {

        constructor:ParseSchema,

        getClass:function(className, errorCallback) {
            var parseClass = self.schemaDictionary[className];
            if (!parseClass){
                errorCallback({js: "ParseSchema", func: "getPropertyType", className: className, message: "The class was not found in the schema"});
                return null;
            };
            return parseClass;
        },

        getPropertyType:function(className, property, errorCallback) {
            var parseClass = this.getClass(className, errorCallback);

            var column = parseClass.fields[property];
            if (!column){
                errorCallback({js: "ParseSchema", func: "getPropertyType", className: className, column: property, message: "The column was not found in the class"});
                return null;
            }
            return column.type;
        },

        getClassRelations:function(className, errorCallback) {
            var parseClass = this.getClass(className, errorCallback);
            var relations = [];
            for (var property in parseClass.fields) {
                var propertyType = this.getPropertyType(className, property, errorCallback);
                switch (propertyType) {
                    case "Relation":
                        relations.push(property);
                        break;

                    default:
                        break;
                }
            }
            return relations;
        },

        getClassRelationTargetClass:function(className, relationName, errorCallback) {
            var parseClass = this.getClass(className, errorCallback);

            return parseClass.fields[relationName].targetClass;
        },

        toUUid:function(str){
            return '00000000-0000-0000-0000-00' + str;
        }

    };
})();

module.exports = ParseSchema;
