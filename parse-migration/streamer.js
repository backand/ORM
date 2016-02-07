/**
 * Created by Dell on 2/2/2016.
 */


function Streamer() {
}

Streamer.prototype = (function() {
    // Private code here

    return {

        constructor:Streamer,

        getData:function(datalink, fileName, callback) {

            var data = require(datalink + fileName);
            if (data.results) callback(fileName, data.results);
            else {
                callback(fileName, null);
            }
        }

    };
})();

module.exports = Streamer;