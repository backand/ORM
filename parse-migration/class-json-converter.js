/**
 * Created by Dell on 2/2/2016.
 */
var logger = require('./logging/logger').getLogger('ClassJsonConverter');

var self = this;

function ClassJsonConverter(schema) {

    self.schema = schema;
}

ClassJsonConverter.prototype = (function () {
    // Private code here


    var getMySQLPoint = function (value) {
        if (!value) return null;
        return {lat: value.latitude, long: value.longitude};
    };

    var getMySQLFile = function (value) {
        if (!value) return null;
        return value.url;
    };

    var getInsertColumns = function (className, errorCallback) {
        var columns = [];
        logger.trace("className: " + className);

        var parseClass = self.schema.getClass(className, errorCallback);

        logger.trace(JSON.stringify(parseClass));

        for (var property in parseClass.fields) {
            var propertyType = self.schema.getPropertyType(className, property, errorCallback);
            switch (propertyType) {
                case "Boolean":
                case "Date":
                case "Number":
                case "File":
                    columns.push(property);
                    break;

                case "String":
                    if (property == "objectId") {
                        columns.push("id");
                    }
                    else {
                        columns.push(property);
                    }
                    break;

                case "GeoPoint":
                    columns.push(property);
                    break;

                case "Array":
                    break;

                case "Object":
                    break;

                case "Relation":
                    break;

                case "Pointer":
                    break;

                case "ACL":
                    break;

                default:
                    errorCallback({
                        js: "ClassJsonConverter",
                        func: "getInsertStatement",
                        className: className,
                        column: property,
                        message: "The column has no recognized type"
                    });
                    break;
            }
        }
        return columns;
    };

    var addValueToSingleType = function(propertyType, values, value, errorCallback, className, jsonFromParse, property) {
        switch (propertyType) {
            case "Boolean":
            case "Date":
            case "Number":
                values.push(value);
                break;

            case "String":
                if (property == "objectId") {
                    values.push(self.schema.toUUid(value));
                }
                else {
                    values.push(value);
                }
                break;

            case "GeoPoint":
                values.push(getMySQLPoint(value));
                break;

            case "File":
                values.push(getMySQLFile(value));
                break;

            case "Array":
                break;

            case "Object":
                break;

            case "Relation":
                break;

            case "Pointer":
                break;

            case "ACL":
                break;

            default:
                errorCallback({
                    js: "ClassJsonConverter",
                    func: "getValuesToInsertStatement",
                    className: className,
                    objectId: jsonFromParse.objectId,
                    column: property,
                    message: "The column has no recognized type"
                });
                break;
        }
    }

    return {

        constructor: ClassJsonConverter,

        getInsertStatement: function (className, errorCallback) {
            var columns = getInsertColumns(className, errorCallback);
            return "insert into `" + className + "` (`" + columns.join("`,`") + "`) values ?";
        },

        getValuesToInsertStatement: function (className, jsonFromParse, errorCallback) {
            var values = [];
            var parseClass = self.schema.getClass(className, errorCallback);
            for (var property in parseClass.fields) {
                try {
                    // schema field not exist in json
                    var propertyType = self.schema.getPropertyType(className, property, errorCallback);
                    var value = null;


                    if(jsonFromParse.hasOwnProperty(property)) {
                        value = jsonFromParse[property];
                    }
                    addValueToSingleType(propertyType, values, value, errorCallback, className, jsonFromParse, property);
                }
                catch (err) {
                    errorCallback({
                        js: "ClassJsonConverter",
                        func: "getValuesToInsertStatement",
                        className: className,
                        objectId: jsonFromParse.objectId,
                        column: property,
                        message: "Parse to MySQL transformation error",
                        internalError: err
                    });
                }
            }
            return values;
        }

    };
})();

module.exports = ClassJsonConverter;





