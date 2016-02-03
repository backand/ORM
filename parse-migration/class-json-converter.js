/**
 * Created by Dell on 2/2/2016.
 */
var logger = require('./../logging/logger').getLogger('ClassJsonConverter');

var jsonFromParseExample =
{
    "amount": 10000000000,
    "best": {
        "__type": "Pointer",
        "className": "comment",
        "objectId": "JkmFZ65bPq"
    },
    "content": "hello",
    "createdAt": "2016-02-01T06:40:55.155Z",
    "date": {
        "__type": "Date",
        "iso": "2016-02-01T07:05:29.089Z"
    },
    "location": {
        "__type": "GeoPoint",
        "latitude": 51.5034,
        "longitude": -0.1275
    },
    "objectId": "iaozZi0VY6",
    "photo": {
        "__type": "File",
        "name": "tfss-b9461654-6883-4541-b194-f0b48b699e60-angular.jpg",
        "url": "http://files.parsetfss.com/b0ba5cbd-d164-47bc-a635-9d467a6e539d/tfss-b9461654-6883-4541-b194-f0b48b699e60-angular.jpg"
    },
    "tags": [
        "a1",
        "a2",
        "a3"
    ],
    "title": "second",
    "updatedAt": "2016-02-02T09:34:32.923Z"
};


var self = this;

function ClassJsonConverter(schema) {

    self.schema = schema;
}

ClassJsonConverter.prototype = (function () {
    // Private code here


    var getMySQLPoint = function (value) {
        if (!value) return null;
        return [{lat: value.latitude, long: value.longitude}];
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
                case "String":
                case "Number":
                case "GeoPoint":
                case "ACL":
                case "File":
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
            case "ACL":
            case "String":
            case "Number":
                values.push(value);
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





