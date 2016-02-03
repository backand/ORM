/**
 * Created by Dell on 2/2/2016.
 */

var dataExample =
[
    {
        "content": "body",
        "createdAt": "2016-02-01T06:40:36.068Z",
        "objectId": "HxmUtLYu9V",
        "title": "first",
        "updatedAt": "2016-02-01T06:40:41.953Z"
    },
    {
        "amount": -5.36,
        "createdAt": "2016-02-01T06:56:48.505Z",
        "deleted": false,
        //"location": {
        //    "__type": "GeoPoint",
        //    "latitude": 0,
        //    "longitude": 0
        //},
        "objectId": "a2HJcltEq7",
        "updatedAt": "2016-02-02T09:33:32.977Z"
    },
    {
        "amount": 0,
        "best": {
            "__type": "Pointer",
            "className": "comment",
            "objectId": "JkmFZ65bPq"
        },
        "content": "word2",
        "createdAt": "2016-02-01T06:57:40.385Z",
        "deleted": true,
        "objectId": "fcaawykXYL",
        "title": "form",
        "updatedAt": "2016-02-02T09:34:31.051Z"
    },
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
        //"location": {
        //    "__type": "GeoPoint",
        //    "latitude": 51.5034,
        //    "longitude": -0.1275
        //},
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
    }
];

function Streamer() {
}

Streamer.prototype = (function() {
    // Private code here

    return {

        constructor:Streamer,

        getData:function(datalink, callback) {
            callback("post", dataExample);
        }

    };
})();

module.exports = Streamer;