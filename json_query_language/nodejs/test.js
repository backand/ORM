var expect = require("chai").expect;
var _ = require('underscore');

var transformJsonIntoSQL = require("./algorithm").transformJsonIntoSQL;



describe("translate mysql", function(){

	it("sub query", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
				{
					"object" : "Employees",
					"q": {
						"DeptId" : {
							"$in" : {
								"object" : "Dept",
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

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT * FROM blabla WHERE (DeptId IN ( SELECT DeptId FROM Dept WHERE (Budget > 4500)    )) ");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }
	});

	it("or query", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
				{
					"object" : "Employees",
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

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT * FROM Employees WHERE (( Budget > 3000 ) OR ( Location = 'Tel Aviv' ))");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }

	});

	it("retrieve parent object based on child object properties", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
	
				{
					"object": "Dept",
					"q": {
						"DeptId" : {

							"$in": {
								"object": "Employee",
								"q": {
									"age": 30
								},
								"fields": ["DeptId"]
							}

						}
					}
				},

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT * FROM Dept WHERE (DeptId IN ( SELECT DeptId FROM Employee WHERE (age = 30) ))");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }

	});

	it("retrieve parent object based existence of child with properties", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
				{
					"object": "Dept",
					"q": {
						

							"$exists": {
								"object": "Employee",
								"q": {
									"age": 30
								},
								"fields": ["DeptId"]
							}

					}
				},

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT * FROM Dept WHERE (EXISTS (SELECT DeptId FROM Employee WHERE (age = 30) ))");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }

    });

    it("group by with aggregate", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
				{
					"$union": 	[
						{
							"object" : "Employees",
							"q" : {
								"$or" : [
									{
										"Budget" : {
											"$gt" : 20
										}
									},
									{
										"Location" : { 
											"$like" :  "Tel Aviv"
										}
									}
								]
							},
							fields: ["Location", "country"],
							order: [["X", "asc"], ["Budget", "desc"]],
							groupBy: ["country"],
							aggregate: {
								Location: "$concat"
							}
						},
						{
							"object" : "Person",
							"q" : {
								"name": "john"
							},
							fields: ["City", "country"],
							limit: 11
						}
					]
				},

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT GROUP_CONCAT(Location),country FROM blabla WHERE (( Budget > 20 ) OR ( Location LIKE 'Tel Aviv' )) GROUP BY country ORDER BY X asc , Budget desc  UNION SELECT City,country FROM Person WHERE (name = 'john')   LIMIT 11");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }

    });

    it("between", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";

		try {
			transformJsonIntoSQL(email, password, appName, 
				{
					"object" : "Dept",
					"q": {
						"Budget" : {
							"$between": [3000, 4500]
						}
					},
					"fields" : ["DeptId"]
				},

				false,

				function(err, sql){
					expect(err).to.deep.equal(null);
					expect(sql).to.equal("SELECT DeptId FROM Dept WHERE Budget BETWEEEM 3000 AND 4500");
					done();				
				}
			);
            done();
        }
        catch (e) {
            done(e);
        }
	});

});