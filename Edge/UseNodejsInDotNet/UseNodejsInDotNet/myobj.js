var _ = require('underscore');
console.log(_);
return function (data, callback) {
   // console.log(_);
    console.log(data);
    // var k = _.keys(data);
   // console.log(k);
 //   callback(null, _.keys(data));
    callback(null, data);
}