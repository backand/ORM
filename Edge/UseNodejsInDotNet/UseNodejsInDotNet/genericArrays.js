var _ = require('underscore');
return function (data, callback) {                 
    var o = JSON.parse(data);
    var result = _.pluck(o, 'name');
    var s = JSON.stringify(result);
    callback(null,s);
}