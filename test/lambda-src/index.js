exports.g = g;

var async = require('async');

function iterator(item, callback){
	callback(null, item * 2);
}

function g(event, context){
	var a = event.array;
	console.log(a);
	async.map(a, iterator, function(err, results){
		console.log(err, results);
	    if (err)
	    	context.fail(err);
	    else
	    	context.succeed(results);
	});
}

