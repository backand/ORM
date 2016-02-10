/**
 * Created by Dell on 2/2/2016.
 */
var logger = require('./logging/logger').getLogger('bulks');

var self = this;

function bulks(schema) {

    self.bulksDuctionary = {};
}

bulks.prototype = (function () {
    // Private code here


    var getMySQLPoint = function (value) {
        if (!value) return null;
        return {lat: value.latitude, long: value.longitude};
    };



    return {

        constructor: bulks,

        push: function (className, json) {
            this.getBulk(className).push(json);
        },

        getBulk: function(className){
            if (!self.bulksDuctionary[className])
                self.bulksDuctionary[className] = [];
            return self.bulksDuctionary[className];
        },

        count:function(className){
            return this.getBulk(className).length;
        },

        clear:function(className){
            self.bulksDuctionary[className] = [];
        }
    };
})();

module.exports = bulks;





