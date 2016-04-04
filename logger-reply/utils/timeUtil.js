/**
 * Created by backand on 3/27/16.
 */
var moment = require('moment');

var fromStringToEpoch = function (timeTxt) {
    // input example = "3/24/2016 10:40:35 AM"
    if (!timeTxt) {
        return null;
    }

    return moment(timeTxt, 'MM/DD/YYYY h:mm:ss a').valueOf();
};


module.exports = fromStringToEpoch;

