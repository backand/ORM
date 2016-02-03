/**
 * Created by Dell on 2/2/2016.
 */

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




function PointerConverter() {
}

PointerConverter.prototype = (function(schema) {
    // Private code here
    var getPointerColumns = function(className, errorCallback) {
        var columns = [];
        for (var property in json) {
            var propertyType = schema.getPropertyType(objectId, property, errorCallback);
            switch (propertyType) {
                case "Pointer":
                    columns.push(property);
                    break;

                default:
                    break;
            }
        }
        return columns;
    };


    return {

        constructor:PointerConverter,

        getUpdateStatementForSinglePointer:function(className, property, errorCallback) {
            return "update `" + className + "` set `" + property + "` = ? where objectId = ?";
        },

        getValuesToUpdatePointerStatement:function(className, jsonFromParse, errorCallback) {
            var values = [];
            for (var property in json) {
                try {
                    if (json.hasOwnProperty(property)) {
                        var value = json[property];
                        var propertyType = schema.getPropertyType(className, objectId, property, errorCallback);
                        switch (propertyType) {
                            case "Boolean":
                            case "Date":
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
                                    objectId: json.objectId,
                                    column: property,
                                    message: "The column has no recognized type"
                                });
                                break;
                        }
                    }
                }
                catch(err){
                    errorCallback({
                        js: "ClassJsonConverter",
                        func: "getValuesToInsertStatement",
                        className: className,
                        objectId: json.objectId,
                        column: property,
                        message: "Parse to MySQL transformation error",
                        internalError: err
                    });
                }

                return values;
            }
        }

    };
})();





