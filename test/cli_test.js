var expect = require("chai").expect;
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');

describe("backand cli", function(){

	it.only("get model", function(done){
		this.timeout(4000);
 		var command = 'node_modules/backand/bin/backand get --master  b83f5c3d-3ed8-417b-817f-708eeaf6a945   --user 757e33ac-ad5a-11e5-be83-0ed7053426cb   --app  cli --object items';	
		exec(command, function(err, stdout, stderr) {
			if (err) throw err;
			var positionBody = stdout.indexOf('responseBody:');
			var raw = stdout.substr(positionBody + 'responseBody:'.length);
			var t = raw.trim();
			var r = t.replace(/[^\x00-\x7F]/g, "").replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
			try{
				var p = JSON.parse(r);
			}
			catch(exp){
				console.log(exp);
				throw exp;
			}
		  	expect(p).to.deep.equal({
			    "totalRows": 0,
			    "data": []
			});
		    done();
		});

// expect(result).to.deep.equal();
	});

	it("sync", function(done){
		this.timeout(8000);
		var r = Math.random();
		fs.writeFileSync('./src/x.js', '' + r);
		var command = 'node_modules/backand/bin/backand sync --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder ./src';	
		exec(command, function(err, stdout, stderr) {
			if (err) throw err;
	   	    request.get('https://s3.amazonaws.com/hosting.backand.io/cli/x.js', 
			    function (error, response, body) {
			    	if (error) throw error;
					expect(body.trim()).to.equal('' + r);
					done();
		    });
		});
	});

	
});
