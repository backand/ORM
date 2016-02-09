/**
 * Created by Dell on 2/2/2016.
 */

var fs = require('fs')
    , JSONStream = require('JSONStream')
    , es = require('event-stream');

function Streamer() {
}

Streamer.prototype = (function () {
    // Private code here
    function getDataInner(datalink, fileName, onData, finishCallback, startId) {
        var canRead = false;

        if (!startId) {
            canRead = true;
        }

        var path = datalink + fileName;
        var readableStream = fs.createReadStream(path)
            .pipe(JSONStream.parse('*'))
            .pipe(es.mapSync(function (data) {
                if (!canRead && data && data.id === startId) {
                    canRead = true;
                }

                if (canRead) {
                    onData(data);
                }
            }));

        readableStream.on('finish', finishCallback);

    }

    return {

        constructor: Streamer,

        getDataFromSpecificObjectId: function (datalink, fileName, objectId, onData, finishCallback) {
            this.getDataInner(datalink, fileName, onData, finishCallback, objectId);
        },

        getData: function (datalink, fileName, onData, finishCallback) {
            this.getDataInner(datalink, fileName, onData, finishCallback);
        }

    };
})();

module.exports = Streamer;