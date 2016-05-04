process.chdir(__dirname);
var expect = require("chai").expect;
var transformJson = require("../json_query_language/nodejs/algorithm").transformJson;

describe("algorithm", function(){
	it("aggregate", function(done){
		var json = 
			{
				"object": "scores",
				"q": {
				    "location" : "us"
				},
				"fields": ["userId","score"],
				"groupBy": ["userId"],
				"aggregate": {
				   "score": "$max"
				}
		    };
		var sqlSchema = [
			{ 
				"name": "scores",
				"fields": {
					"userId": {
						"type": "float"
					},
					"location": {
						"type": "string"
					},
					"score": {
						"type": "float"
					}
				}
			}
		];
		var isFilter = false;
		var shouldGeneralize = false;
		var v = transformJson(json, sqlSchema, isFilter, shouldGeneralize, function(err, result){
			expect(err).to.equal(null);
			expect(result).to.deep.equal(

				{ 
					str: 'SELECT `scores`.`userId`,`scores`.`MAX(score)` AS `score` FROM `scores` WHERE (`scores`.`location` = \'us\') GROUP BY `scores`.`userId`  ',
					select: 'SELECT `scores`.`userId`,`scores`.`MAX(score)` AS `score`',
					from: 'FROM `scores`',
					where: '`scores`.`location` = \'us\'',
					group: 'GROUP BY `scores`.`userId`',
					order: '',
					limit: '' 
				}

			);
			done();
		});

	});

	it("sub query", function(done){
		var json = {
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
		};
		var sqlSchema = [
			{ 
		  		"name" : "Employees", 
		  		"dbName": "blabla", 
		  		"fields" : {
					"Budget": {
						"dbname": "bbb",
						"type": "float"
					},
					"Location": {
						"type": "string"
					},
					"X": {
						"type": "float"
					},
					"y": {
						"object": "users"
					},
					"country": {
						"type": "string"
					},
					"DeptId": {
						"type": "string"
					}
				}
			},
			{
				"name" : "Dept", 
				"fields" : {
					"DeptId": {
						"type": "string"
					},
					"Budget": {
						"type": "float"
					}
				}
			}
		];
		var isFilter = false;
		var shouldGeneralize = false;
		var v = transformJson(json, sqlSchema, isFilter, shouldGeneralize, function(err, result){
			expect(err).to.equal(null);
			expect(result).to.deep.equal(

				{ 
					str: 'SELECT * FROM `blabla` WHERE (`blabla`.`DeptId` IN ( ( SELECT `Dept`.`DeptId` FROM `Dept` WHERE (`Dept`.`Budget` > 4500)    ) ) )   ',
					select: 'SELECT *',
					from: 'FROM `blabla`',
					where: '`blabla`.`DeptId` IN ( ( SELECT `Dept`.`DeptId` FROM `Dept` WHERE (`Dept`.`Budget` > 4500)    ) ) ',
					group: '',
					order: '',
					limit: '' 
				}

			);
			done();
		});

	});

	it("geo", function(done){
		var json = { 
		   "object": "items",
		   "q": {
		       "name": { "$eq" : "kuku" },
		       "p": { "$within": [[32.0638130, 34.7745390], 50000] }
		   }  
		};
		var sqlSchema = [
			{
			    "name": "items",
			    "fields": {
			      "name": {
			        "type": "string"
			      },
			      "p": {
			      	"type": "point"
			      },
			      "description": {
			        "type": "text"
			      },
			      "price": {
			        "type": "float"
			      },
			      "category": {
			        "type": "string"
			      },
			      "user": {
			        "object": "users"
			      }
			    }
		  }
		];
		var isFilter = false;
		var shouldGeneralize = false;
		var v = transformJson(json, sqlSchema, isFilter, shouldGeneralize, function(err, result){
			expect(err).to.equal(null);
			expect(result).to.deep.equal(

				{ 
					str: 'SELECT * FROM `items` WHERE (`items`.`name` = \'kuku\' AND ST_Distance ( `items`.`p`, ST_GeomFromText(\'POINT( 32.063813 34.774539 )\') ) <= 50000 /(1609.344 * 69) )   ',
					select: 'SELECT *',
					from: 'FROM `items`',
					where: '`items`.`name` = \'kuku\' AND ST_Distance ( `items`.`p`, ST_GeomFromText(\'POINT( 32.063813 34.774539 )\') ) <= 50000 /(1609.344 * 69) ',
					group: '',
					order: '',
					limit: '' 
				}

			);
			done();
		});

	});

	it("filter", function(done){
		var json = 
			{
				"object":"todo",
				"q":{
					"created_by":{
						"$in":{
							"object":"users",
							"q":{
								"email":{
									"$eq":"{{sys::username}}"
								}
							},
							"fields":["id"]
						}
					}
				}
			};
		var sqlSchema = [
			{
		  		"name":"todo",
		  		"fields":{
		  			"created_by":{"object":"users"},
		  			"description":{"type":"string"},
		  			"completed":{"type":"boolean"},
		  			"notes":{"collection":"notes","via":"todo"}
		  		}
		  	},
		  	{
		  		"name":"notes",
		  		"fields":{
		  			"todo":{"object":"todo"},"description":{"type":"string"}
		  		}
		  	},
		  	{

		  		"name":"users",
		  		"fields":{
		  			"id": { 
			  			"type" : "integer"
			  		},
		  			"todo":{"collection":"todo","via":"created_by"},
		  			"email":{"type":"string"},
		  			"firstName":{"type":"string"},
		  			"lastName":{"type":"string"}
		  		}
		  	}
		];
		var isFilter = true;
		var shouldGeneralize = false;
		var v = transformJson(json, sqlSchema, isFilter, shouldGeneralize, function(err, result){
			expect(err).to.equal(null);
			expect(result).to.deep.equal(

				{ 
					str: 'SELECT * FROM `todo` WHERE (`todo`.`created_by` IN ( ( SELECT `users`.`id` FROM `users` WHERE (`users`.`email` = {{sys::username}})    ) ) )   ',
					select: 'SELECT *',
					from: 'FROM `todo`',
					where: '`todo`.`created_by` IN ( ( SELECT `users`.`id` FROM `users` WHERE (`users`.`email` = {{sys::username}})    ) ) ',
					group: '',
					order: '',
					limit: '' 
				}

			);
			done();
		});

	});

	it("union", function(done){
		var json = 
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
			}
		;
		var sqlSchema = [
	 		{ 
		  		"name" : "Employees", 
		  		"dbName": "blabla", 
		  		"fields" : {
					"Budget": {
						"dbname": "bbb",
						"type": "float"
					},
					"Location": {
						"type": "string"
					},
					"X": {
						"type": "float"
					},
					"y": {
						"object": "users"
					},
					"country": {
						"type": "string"
					}
				}
			},
			{ 
		  		"name" : "Person", 
		  		"fields" : {
					"Name": {
						"type": "string"
					},
					"City": {
						"type": "string"
					},
					"country": {
						"type": "string"
					}
				}
			}
		];
		var isFilter = true;
		var shouldGeneralize = false;
		var v = transformJson(json, sqlSchema, isFilter, shouldGeneralize, function(err, result){
			expect(err).to.equal(null);
			expect(result).to.deep.equal(

				{ 
					sql: 'SELECT `blabla`.`GROUP_CONCAT(Location)` AS `Location`,`blabla`.`country` FROM `blabla` WHERE (( `blabla`.`Budget` > 20 ) OR ( `blabla`.`Location` LIKE ( \'%Tel Aviv%\' )  )) GROUP BY `blabla`.`country` ORDER BY `blabla`.`X` asc , `blabla`.`Budget` desc  UNION SELECT `Person`.`City`,`Person`.`country` FROM `Person` WHERE (`Person`.`name` = \'john\')   LIMIT 11',
					select: '',
					from: '',
					where: '',
					group: '',
					order: '',
 					limit: '' 
 				}

			);
			done();
		});

	});
});