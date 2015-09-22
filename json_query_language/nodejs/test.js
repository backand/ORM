var expect = require("chai").expect;
var _ = require('underscore');

var queryTranslator = require("./algorithm").transformJson;



describe("translate mysql", function(){

	it("sub query", function(done){
		var v = queryTranslator(
			{
				"table" : "Employees",
				"q": {
					"DeptId" : {
						"$in" : {
							"table" : "Dept",
							"q": {
								"Budget" : {
									"$gt" : 4500
								}
							},
							"fields" : [
								"DeptId"
							]
						}
					}
				}
			},
			function(err, mysqlQuery){
				expect(err).to.deep.equal(null);
				expect(mysqlQuery).to.equal("SELECT * FROM Employees WHERE (DeptId $in ( SELECT DeptId FROM Dept WHERE (Budget $gt 4500) ))");
				done();
			}
		);

	});

	it("or query", function(done){
		var v = queryTranslator(				
			{
				"table" : "Employees",
				"q" : {
					"$or" : [
						{
							"Budget" : {
								"$gt" : 3000
							}
						},
						{
							"Location" : "Tel Aviv"
						}
					]
				}
			},
			function(err, mysqlQuery){
				expect(err).to.deep.equal(null);
				expect(mysqlQuery).to.equal("SELECT * FROM Employees WHERE (( Budget $gt 3000 ) OR ( Location = 'Tel Aviv' ))");
				done();
			}
		);

	});

});