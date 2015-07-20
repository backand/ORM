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
});