/**
 * Created by backand on 2/24/16.
 */

/**
 * Created by Dell on 2/2/2016.
 */
var idTransformer = require('./idTransformer');
var self = this;
const NAME_LIMIT = 32;
const NAME_LIMIT_IN_RELATION = 16;
const PARSE_USERS = "_User";
const BACKAND_USERS = "users";
const bcryptPassword = "bcryptPassword";
const firstName = "firstName";
const lastName = "lastName";

var backandUsersColumns = {"firstname":"firstName", "lastname": "lastName", "email": "email", "username": "username"}

function ParseSchema(schema) {
    self.schema = schema;

    self.schemaDictionary = {};

    for (var i in self.schema) {
        var parseClass = self.schema[i];
        self.schemaDictionary[parseClass.className] = parseClass;
    };

    this.adjustNames();
}

ParseSchema.prototype = (function() {
    // Private code here
    var getAdjustedClassName = function(parseClass, nameLimit){
        if (parseClass.className == PARSE_USERS && parseClass.className == PARSE_USERS) {
            return BACKAND_USERS;
        }
        var adjustedName = parseClass.className.substr(0,nameLimit);
        if (!self.schemaDictionary[adjustedName])
            return adjustedName;

        var k = 0;
        for (var j = 1; j <= 4; j++){
            for (var i = 0; i <= 9; i++) {
                k++;
                var adjustedName = parseClass.className.substr(0, nameLimit - j);
                adjustedName = adjustedName + k;
                if (!self.schemaDictionary[adjustedName])
                    return adjustedName;
            }
        }
        throw new Error("Could not adjust class name " + parseClass.className + ".");
    };

    var adjustClassName = function(parseClass, nameLimit){
        var adjustedName = parseClass.className;
        if (parseClass.className.length > nameLimit || parseClass.className == PARSE_USERS){
            adjustedName = getAdjustedClassName(parseClass, nameLimit);
            delete self.schemaDictionary[parseClass.className];
            parseClass.className = adjustedName;
            self.schemaDictionary[adjustedName] = parseClass;
        }
        return adjustedName;
    };

    var adjustClassNames = function(relations) {
        for (var i in self.schema) {
            var parseClass = self.schema[i];
            parseClass.originalName = parseClass.className;
            var nameLimit = NAME_LIMIT;
            var isRelated = false;
            if (relations[parseClass.originalName]){
                nameLimit = NAME_LIMIT_IN_RELATION;
                isRelated = true;
            }
            var adjustedName = adjustClassName(parseClass, nameLimit);
            var isAdjusted = adjustedName != parseClass.originalName;
            if (isRelated && isAdjusted){
                var relatedClass = relations[parseClass.originalName];
                for (var i in relatedClass) {
                    var column = relatedClass[i];
                    column.targetClass = adjustedName;
                };
            }
        };
    };

    var getAdjustedColumnName = function(parseClass, property, nameLimit) {
        if (backandUsersColumns[property.toLowerCase()]){
            return getAdjustedUsersColumnName(parseClass, property);
        }

        if (property.length <= nameLimit){
            return property;
        }

        var adjustedName = property.substr(0,nameLimit);
        if (!parseClass.fields[adjustedName])
            return adjustedName;

        var k = 0;
        for (var j = 1; j <= 4; j++){
            for (var i = 0; i <= 9; i++) {
                k++;
                var adjustedName = property.substr(0, nameLimit - j);
                adjustedName = adjustedName + k;
                if (!parseClass.fields[adjustedName])
                    return adjustedName;
            }
        }
        throw new Error("Could not adjust field " + property + " name.");
    };

    var adjustColumnName = function(parseClass, property, nameLimit) {
        var adjustedName = getAdjustedColumnName(parseClass, property, nameLimit);
        var column = parseClass.fields[property];
        delete parseClass.fields[property];
        parseClass.fields[adjustedName] = column;
        return column;
    };

    function getAdjustedUsersColumnName(parseClass, property) {
        if (parseClass.className != PARSE_USERS)
            return property;

        var adjustedName = property;

        if (backandUsersColumns[property.toLowerCase()])
            adjustedName = backandUsersColumns[property.toLowerCase()];

        return adjustedName;
    };

    function addRemoveUsersColumns(parseClass){
        parseClass.fields[bcryptPassword] = {
            "type": "String",
            "originalName": bcryptPassword
        }
        if (!parseClass.fields[firstName]){
            parseClass.fields[firstName] = {
                "type": "String",
                "originalName": firstName
            }
        }
        if (!parseClass.fields[lastName]){
            parseClass.fields[lastName] = {
                "type": "String",
                "originalName": lastName
            }
        }
    };

    var adjustClassColumnNames = function(parseClass, relations) {
        for (var property in parseClass.fields) {
            var column = parseClass.fields[property];
            column.originalName = property;

            var nameLimit = NAME_LIMIT;
            if (column.type == "Pointer" || column.type == "Relation"){
                nameLimit = NAME_LIMIT_IN_RELATION;
                if (property.length > nameLimit - 1) {
                    var column = adjustColumnName(parseClass, property, nameLimit - 1);
                }
                if (column.targetClass.length > nameLimit || column.targetClass == PARSE_USERS) {
                    if (!relations[column.targetClass]) {
                        relations[column.targetClass] = [];
                    }

                    relations[column.targetClass].push(column);
                }
            }
            else{
                nameLimit = NAME_LIMIT;
                if (property.length > nameLimit || parseClass.className == PARSE_USERS) {
                    adjustColumnName(parseClass, property, nameLimit);
                }
            }
        }
        if (parseClass.className == PARSE_USERS){
            addRemoveUsersColumns(parseClass);
        }

    };

    var adjustColumnNames = function() {
        var relations = {};
        for (var i in self.schema) {
            var parseClass = self.schema[i];
            adjustClassColumnNames(parseClass, relations);
        }
        return relations;
    };

    var getAdjustedFields = function(parseClass){
        var adjustedFields = [];
        for (var property in parseClass.fields) {
            var column = parseClass.fields[property];
            if (property != column.originalName){
                adjustedFields.push({originalName:column.originalName, adjustedName: property});
            }
        }

        return adjustedFields;
    }

    return {

        constructor:ParseSchema,

        getClass:function(className, errorCallback) {
            var parseClass = self.schemaDictionary[className];
            if (!parseClass){
                if(typeof(errorCallback) == "function") {
                    errorCallback({
                        js: "ParseSchema",
                        func: "getPropertyType",
                        className: className,
                        message: "The class was not found in the schema"
                    });
                }

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

        classHasPointers : function(className,errorCallback){
            var parseClass = this.getClass(className, errorCallback);

            for (var property in parseClass.fields) {
                var propertyType = this.getPropertyType(className, property, errorCallback);
                switch (propertyType) {
                    case "Pointer":
                        return true;
                        break;

                    default:
                        break;
                }
            }
            return false;
        },

        toUUid:function(str){
            return idTransformer.toGuidId(str)
        },

        adjustNames : function(){
            var relations = adjustColumnNames();
            adjustClassNames(relations);
        },

        getAdjustedNames: function(){
            var adjustedNames = [];

            for (var i in self.schema) {
                var parseClass = self.schema[i];
                var adjustedFields = getAdjustedFields(parseClass);
                var adjustedClass = {originalName:parseClass.originalName};
                if (parseClass.className != parseClass.originalName || adjustedFields.length > 0) {
                    if (parseClass.className != parseClass.originalName) {
                        adjustedClass.adjustedName = parseClass.className;
                    }
                    if (adjustedFields.length > 0){
                        adjustedClass.fields = adjustedFields;
                    }
                    adjustedNames.push(adjustedClass);
                }
            };

            return adjustedNames;
        }

    };
})();

module.exports = ParseSchema;
