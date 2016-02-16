/**
 * Created by Dell on 2/4/2016.
 */
/**
 * Created by Dell on 2/2/2016.
 */

var fs = require('fs');
var s3Uploader = require('./fileUploader');
var _ = require('underscore');
var self = this;

var template = fs.readFileSync('./template/report.html', 'utf8');

function Report(fileName, appName) {
    self.appName = appName;
    self.fileName = fileName;
    self.data = {errors: {general: []}, statistics: {}, logs: {}, hasErrors: false};
}

Report.prototype = (function () {

    // Private code here
    var init = function (type, className, action, val) {
        if (!self.data[type][className]) {
            self.data[type][className] = {};
            self.data[type][className][action] = val;
        }
        if (!self.data[type][className][action]) {
            self.data[type][className][action] = val;
        }
    };

    var initErrors = function (className, action) {
        self.hasErrors = true;
        init("errors", className, action, [])
    };
    var initStatistics = function (className, action) {
        init("statistics", className, action, 0)
    };
    var initInsertErrors = function (className) {
        initErrors(className, "inserts")
    };
    var initPointerErrors = function (className) {
        initErrors(className, "pointers")
    };
    var initRelationErrors = function (className, relationName) {
        init("errors", className, "relations", {})
        if (!self.data.errors[className].relations[relationName])
            self.data.errors[className].relations[relationName] = [];

    };
    var initInsertStatistics = function (className) {
        initStatistics(className, "inserts")
    };
    var initPointerStatistics = function (className) {
        initStatistics(className, "pointers")
    };
    var initRelationStatistics = function (className, relationName) {
        init("statistics", className, "relations", {})
        if (!self.data.statistics[className].relations[relationName])
            self.data.statistics[className].relations[relationName] = 0;

    };

    return {

        constructor: Report,
        generalError: function (err) {
            self.data.errors.general.push(err);
        },
        insertClassError: function (className, err) {
            initInsertErrors(className);
            self.data.errors[className].inserts.push(err.message);
        },
        updatePointerError: function (className, err) {
            initPointerErrors(className);
            self.data.errors[className].pointers.push(err);
        },
        updateRelationError: function (className, relationName, err) {
            initRelationErrors(className, relationName);
            self.data.errors[className].relations[relationName].push(err);
        },
        insertClassSuccess: function (className, rows) {
            initInsertStatistics(className);
            self.data.statistics[className].inserts = self.data.statistics[className].inserts + rows;
        },
        updatePointerSuccess: function (className, rows) {
            initPointerStatistics(className);
            self.data.statistics[className].pointers = self.data.statistics[className].pointers + rows;
        },
        updateRelationSuccess: function (className, relationName, rows) {
            initRelationStatistics(className, relationName);
            self.data.statistics[className].relations[relationName] = self.data.statistics[className].relations[relationName] + rows;
        },
        log : function(message){
            self.data.logs.push(message);
        },
        setData : function(data){
          // for test. we love you relly
            self.data = data;

        },
        write: function () {

            var compiled =  _.template(template);
            self.data.appName = self.appName;
            var  fileData = compiled(self.data);
            s3Uploader.uploadFile(self.fileName, fileData, 'text/html', self.appName);
        }
    };
})();

module.exports = Report;



