var _ = require('lodash');

function extractLogRequestId(logs){
	var lastLine = _.findLast(logs, function(l){
		return l.indexOf('END RequestId: ') > -1;
	});
	var requestId = lastLine.replace(/END RequestId: /, '').replace(/\s/g, ' ').split(" ")[0].trim();
	return requestId;
}

module.exports.extractLogRequestId = extractLogRequestId;