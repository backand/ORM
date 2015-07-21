var expect = require("chai").expect;
var validator = require("../validate_schema.js").validator;
 
describe("validate", function(){
	it("disallow columns with dashes", function(done){
		var v = validator(
			[			 	
				{
					"name": "user",
					"fields": {
						"na-me": {
							"type": "string"
						},
						"age": {
							"type": "datetime",
						}
					}
				}
			]
		);
		expect(v).to.deep.equal(
			{ 
				valid: false,
  			    warnings: [ 'relation: user column:na-me - column name should not contain dash, use undescore instead' ] 
  			}
  		);
		done();
	});

	it("schema with relationships cannot require relationship columns, n:m relationships not allowed", function(done){
		var v = validator(
			[ 	
				{
					"name": "user",
					"fields": {
						"name": {
							"type": "string"
						},
						"age": {
							"type": "datetime",
						},
						"dogs":{
							"collection": "pet",
							"via": "owner",
							"required": true
						}
					}
				},

				{ 

					"name": "pet",

					"fields": {
						"name": {
							"type": "string"
						},
						"registered": {
							"type": "boolean"
						},
						"owner":{
							"object": "user",
							"required": true
						}
					}
						
				},

				{
					"name": "walker",
					"fields": {
						"name": {
							"type": "string"
						},
						"age": {
							"type": "datetime"
						},
						"dogs":{
							"collection": "animal",
							"via": "owners"
						}
					}
				},


				{
					"name": "animal",
					"fields": {
						"name": {
							"type": "string"
						},
						"breed": {
							"type": "string"
						},
						"owners":{
							"collection": "walker",
							"via": "dogs"
						}
					}
				}
			]
		);
		expect(v).to.deep.equal(
			{ 
				valid: false,
  			    warnings: [
  			    	"a relationship column cannot be required to be set or not set:user dogs",
      				"a relationship column cannot be required to be set or not set:pet owner",
      			    "multi select relationship are not allowed: relation walker attribute dogs and relation animal attribute owners",
      			    "multi select relationship are not allowed: relation animal attribute owners and relation walker attribute dogs"
  			    ] 
  			}
  		);
		done();
	});

	it("declare valid schema with relationships", function(done){
		var v = validator(
			[ 	
							
				{
					"name": "R",

					"fields": {
						"A": {
							"type": "float",
							"defaultValue": 20
						},

						"B": {
							"type": "string",
							"required": true
						}
					}

				},

				{

					"name": "U",


					"fields": {

						"F": {
							"type": "string",
							"required": true
						},

						"G": {
							"type": "float"
						},

						"H": {
							"type": "string"
						}
					}
				}

			]
		);
		expect(v).to.deep.equal(
			{ 
				valid: true,
  			    warnings: [] 
  			}
  		);
		done();
	});
});