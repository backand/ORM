/**
 * Created by Dell on 2/2/2016.
 */

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
        }

    };
})();

module.exports = ParseSchema;
