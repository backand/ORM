var expect = require("chai").expect;
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var async = require('async');
var del = require('del');

describe("backand cli", function(){

	it("sync", function(done){
		this.timeout(32000);
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

	it("lambda", function(done){
		this.timeout(64000);	
		async.waterfall([
		    function(callback) { 
		        del.sync(['items', '*.zip']); // delete existing file system folder of action

		        // see if lambda exists
		        request.get('https://api.backand.com/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"lambda"}]', 
		        	{
		        		auth: {
							'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
							'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
						} 	
		        	},
		        	function(err, response, body){
		        		callback(err, JSON.parse(body));	        	
		        	}
		        );
		    },

		    function(body, callback) { // delete lambda if it exists
		     	if (body.totalRows > 0){
			        request.delete('https://api.backand.com/1/businessRule/' + body.data[0]["iD"], 
			        	{
			        		auth: {
								'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
								'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
							} 	
			        	},
			        	function(err, response, body){
			        		callback(err);	        	
			        	}
			        );		     		
		     	}
		     	else{
		     		callback(null);
		     	}
		    },

		    function(callback) { // init action  
		        var commandActionInit = 'node_modules/backand/bin/backand action init --object items --action lambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
				exec(commandActionInit, function(err, stdout, stderr) {
					callback(err);  	    
				});
		        
		    },
		    function(callback) { // deploy action  
		        var commandActionDeploy = 'node_modules/backand/bin/backand action deploy --object items --action lambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder ./items/lambda';	
				exec(commandActionDeploy, function(err, stdout, stderr) {
					callback(err, 'deploy');
				});		        
		    },
		],
		// optional callback
		function(err, result) {
			// clean by deleting existing action folder
			del.sync(['items', '*.zip']);	    
		    if (err){
		    	throw (err);
		    }
		    else{
		    	done();
		    }
		});

		
	});

});
