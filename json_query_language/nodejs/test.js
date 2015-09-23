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
				expect(mysqlQuery).to.equal("SELECT * FROM Employees WHERE (DeptId IN ( SELECT DeptId FROM Dept WHERE (Budget > 4500) ))");
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
				expect(mysqlQuery).to.equal("SELECT * FROM Employees WHERE (( Budget > 3000 ) OR ( Location = 'Tel Aviv' ))");
				done();
			}
		);

	});

	it("retrieve parent object based on child object properties", function(done){
		var v = queryTranslator(				
			{
				"table": "Dept",
				"q": {
					"DeptId" : {

						"$in": {
							"table": "Employee",
							"q": {
								"age": 30
							},
							"fields": ["DeptId"]
						}

					}
				}
			},
			function(err, mysqlQuery){
				expect(err).to.deep.equal(null);
				expect(mysqlQuery).to.equal("SELECT * FROM Dept WHERE (DeptId IN ( SELECT DeptId FROM Employee WHERE (age = 30) ))");
				done();
			}
		);

	});

	it("retrieve parent object based existence of child with properties", function(done){
		var v = queryTranslator(				
			{
				"table": "Dept",
				"q": {
					

						"$exists": {
							"table": "Employee",
							"q": {
								"age": 30
							},
							"fields": ["DeptId"]
						}

				}
			},
			function(err, mysqlQuery){
				expect(err).to.deep.equal(null);
				expect(mysqlQuery).to.equal("SELECT * FROM Dept WHERE (EXISTS (SELECT DeptId FROM Employee WHERE (age = 30) ))");
				done();
			}
		);

	});

});