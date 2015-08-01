var expect = require("chai").expect;
var request = require('request');
var _ = require('underscore');

var validator = require("../validate_schema.js").validator;
var transformer = require("../transform.js").transformer;
var connectionInfo = require("../get_connection_info"); 
var fetchTables = require("../backand_to_object").fetchTables; 

var api_url = require('../config').api_url;
var tokenUrl = api_url + "/token";

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

	it("tables with n:m relationships are not allowed", function(done){
		var v = validator(
			[ 	
							
				{ 
					name: "R", 
					fields: {
						a: {
							type: "float"
						},
						b: {
							type: "string"
						},
						dogs: {
							collection: "U",
							via: "owner"
						}
					}
				},
				{ 
					name: "S", 
					fields: {
						h: {
							type: "float"
						},
						j: {
							type: "string"
						},
						people: {
							collection: "T",
							"via": "myS"
						}
					}
				},
				{ 
					name: "T", 
					fields: {
						z: {
							type: "float"
						},
						q: {
							type: "string"
						},
						myS: {
							collection: "S",
							"via": "people"
						}
					}
				},

				{ 
					name: "U", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						},
						owner: {
							object: 'R'
						}
					}
				}

			]
		);
		expect(v).to.deep.equal(
			{ 
				valid: false,
  			    warnings: [
  			    	"multi select relationship are not allowed: relation S attribute people and relation T attribute myS",
      			    "multi select relationship are not allowed: relation T attribute myS and relation S attribute people"
  			    ] 
  			}
  		);
		done();
	});

	it("defalt values of columns are of the right type", function(done){
		var v = validator(
			[ 	
							
			 	{
					name: "user",
					fields: {
						name: {
							type: 'string',
							defaultValue: 200
						},
						age: {
							type: 'datetime',
							defaultValue: '2015-09-08'
						},
						dogs:{
							collection: 'pet',
							via: 'owner'
						}
					}
				},	

				{ 

					name: "pet",

					fields: {
						name: {
							type: 'string'
						},
						registered: {
							type: 'boolean'
						},
						owner:{
							object: 'user'
						}
					}
					
				}

			]
		);
		expect(v).to.deep.equal(
			{ 
				valid: false,
  			    warnings: ["column default value should be a string:user name"] 
  			}
  		);
		done();
	});

	it("multiple 1:n relationships between two relations", function(done){
		var v = validator(
			[ 	
							
				{
					name: "person",

					fields: {
							name: {
							type: 'string'
						},
						age: {
							type: 'datetime'
						},
						dogs:{
							collection: 'animal',
							via: 'catOwner'
						},
						cats:{
							collection: 'animal',
							via: 'dogOwner'
						}
					}
				},

				{
					name: "animal",

					fields: {
						name: {
							type: 'string'
						},
						registered: {
							type: 'boolean'
						},
						dogOwner:{
							object: 'person'
						},
						catOwner:{
							object: 'person'
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

describe("transform", function(){
	it("create schema with no relationships", function(done){
		var r = transformer(
			[],
			[
					{

						name: "S",


						fields: {
							C: {
								type: "integer"
							},

							D: {
								type: "string",
								required: true
							}
						}
					},

					{

						name: "U",


						fields: {
							E: {
								type: "integer"
							},

							F: {
								type: "string",
								required: true
							},

							H: {
								type: "string"
							}
						}
					}
			],	
			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": [
      				"create table `S` (`id` int unsigned not null auto_increment primary key, `C` int, `D` varchar(255) not null)",
      			    "create table `U` (`id` int unsigned not null auto_increment primary key, `E` int, `F` varchar(255) not null, `H` varchar(255))"	  
      			],

				"notifications": {},
		        "order": {
		          "columns": {
		            "S": [
		              "C",
		              "D"
		            ],
		            "U": [
		              "E",
		              "F",
		              "H"
		            ]
		          },
		          "tables": [
		            "S",
		            "U"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});

	it("create schema with required columns", function(done){
		var r = transformer(
			[],
			[
				{

					name: "S",


					fields: {
						C: {
							type: "integer"
						},

						D: {
							type: "string",
							required: true
						}
					}
				},

				{

					name: "U",


					fields: {
						E: {
							type: "integer"
						},

						F: {
							type: "string",
							required: true
						},

						H: {
							type: "string"
						}
					}
				}
			],	
			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": [
      				"create table `S` (`id` int unsigned not null auto_increment primary key, `C` int, `D` varchar(255) not null)",
      			    "create table `U` (`id` int unsigned not null auto_increment primary key, `E` int, `F` varchar(255) not null, `H` varchar(255))"	  
      			],

				"notifications": {},
		        "order": {
		          "columns": {
		            "S": [
		              "C",
		              "D"
		            ],
		            "U": [
		              "E",
		              "F",
		              "H"
		            ]
		          },
		          "tables": [
		            "S",
		            "U"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});

	it("create schema with default values for columns", function(done){
		var r = transformer(
			[],
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

				}
			],	
			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": ["create table `R` (`id` int unsigned not null auto_increment primary key, `A` float(8, 2) default 20, `B` varchar(255) not null)"],

				"notifications": {},
		        "order": {
		          "columns": {
		            "R": [
		              "A",
		              "B"
		            ]
		          },
		          "tables": [
		            "R"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});

	it("create schema with 1:n relationships", function(done){
		var r = transformer(
			[],
			[
				{ 
					name: "R", 
					fields: {
						a: {
							type: "float"
						},
						b: {
							type: "string"
						},
						dogs: {
							collection: "U",
							via: "owner"
						}
					}
				},

				{ 
					name: "U", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						},
						owner: {
							object: 'R'
						}
					}
				}
			],	
			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": [
      					    "create table `R` (`id` int unsigned not null auto_increment primary key, `a` float(8, 2), `b` varchar(255))",
      						"create table `U` (`id` int unsigned not null auto_increment primary key, `c` float(8, 2), `d` varchar(255), `owner` int unsigned)",
      						"alter table `U` add constraint r_owner_bkname_dogs foreign key (`owner`) references `R` (`id`) on update cascade on delete cascade"
				],

				"notifications": {},
		        "order": {
		          "columns": {
		            "R": [
		              "a",
		              "b",
		              "dogs"
		            ],
		            "U": [
		              "c",
		              "d",
		              "owner"
		            ]
		          },
		          "tables": [
		            "R",
		            "U"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});

	it("drop columns", function(done){
		var r = transformer(
			[
				{ 
					name: "R", 
					fields: {
						a: {
							type: "float"
						},
						b: {
							type: "string"
						},
						dogs: {
							collection: "U",
							via: "owner"
						}
					}
				},

				{ 
					name: "U", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						},
						owner: {
							object: 'R'
						}
					}
				}
			],
			[
				{ 
					name: "R", 
					fields: {
						b: {
							type: "string"
						}
					}
				},

				{ 
					name: "U", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						}
					}
				}
			],	
			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": [
      				"alter table `R` drop `a`",
      			    "alter table `U` drop `owner`"		   
				],

				"notifications": {
		          "droppedColumns": [
		            {
		              "column": "a",
		              "table": "R"
		            },
		            {
		              "column": "dogs",
		              "table": "R"
		            },
		            {
		              "column": "owner",
		              "table": "U"
		            }
		          ]
		        },
		        "order": {
		          "columns": {
		            "R": [
		              "b"
		            ],
		            "U": [
		              "c",
		              "d"
		            ]
		          },
		          "tables": [
		            "R",
		            "U"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});

	it("drop table involved in 1:n relationships", function(done){
		var r = transformer(

			[
				{ 
					name: "R", 
					fields: {
						a: {
							type: "float"
						},
						b: {
							type: "string"
						},
						dogs: {
							collection: "U",
							via: "owner"
						}
					}
				},

				{ 
					name: "U", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						},
						owner: {
							object: 'R'
						}
					}
				}
			],

			[
				{ 
					name: "R", 
					fields: {
						a: {
							type: "float"
						},
						b: {
							type: "string"
						},
						dogs1: {
							collection: "U1",
							via: "owner"
						}
					}
				},

				{ 
					name: "U1", 
					fields: {
						c: {
							type: "float"
						},
						d: {
							type: "string"
						},
						owner: {
							object: 'R'
						}
					}
				}
			],

			0
		);
		expect(r).to.deep.equal(
			{ 
				"alter": [
      			   "drop table `U`",
      			   "create table `U1` (`id` int unsigned not null auto_increment primary key, `c` float(8, 2), `d` varchar(255), `owner` int unsigned)",
      			   "alter table `U1` add constraint r_owner_bkname_dogs1 foreign key (`owner`) references `R` (`id`) on update cascade on delete cascade"
				],

				"notifications": {
		            "droppedColumns": [
			          	{
			             	"column": "dogs",
	               			"table": "R"
	               		}
		          	],
		    	  	"droppedTables": [
      		    	 	 "U"
      		      	]
		        },
		        "order": {
		          "columns": {
		            "R": [
		            	"a",
		              	"b",
		              	"dogs1"
		            ],
		            "U1": [
		              "c",
		              "d",
		              "owner"
		            ]
		          },
		          "tables": [
		            "R",
		            "U1"
		          ]
		        },
		        "valid": "always",
		        "warnings": []	
			}
  		);
		done();
	});
});

describe("get connection info", function(){
	it("get connection info with correct credentials", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";
	
		request(

			{
			    url: tokenUrl,
			    
			    method: 'POST',
			   
			    form: {
			        username: email,
			        password: password,
			        appname: appName,
			        grant_type: "password"
			    }
			}, 

			function(error, response, body){
	
			    if(!error && response.statusCode == 200) {
			    	var b = JSON.parse(body)
			    	var accessToken = b["access_token"];
			    	var tokenType = b["token_type"];
			    	connectionInfo.getConnectionInfo(accessToken, tokenType, appName, function(err, result){
			    		expect(result).to.deep.equal(
			    			{ 
				    			hostname: 'bk-prod-us1.cd2junihlkms.us-east-1.rds.amazonaws.com',
								port: '3306',
								db: 'backandtestsqlxzhsfvrb',
								username: 'lmlmez3renpyl4j',
								password: 'S12nZ1bx5W3MncYAiciy6s' 
							}
			    		);
			    		done();
			    	});
			    }
			    else{
			    	expect(error).to.equal(null);
			    	expect(response).to.not.equal(null);
			    	if (response){
			    		expect(response.statusCode).to.equal(200);
			    	}
			    	done();

			    }
			}

		);
	});

	it("do not authorize getting connection info with wrong credentials", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "xxx";
	
		request(

			{
			    url: tokenUrl,
			    
			    method: 'POST',
			   
			    form: {
			        username: email,
			        password: password,
			        appname: appName,
			        grant_type: "password"
			    }
			}, 

			function(error, response, body){	

		    	expect(error).to.equal(null);
		    	expect(response).to.not.equal(null);
		    	if (response){
		    		expect(response.statusCode).to.equal(400);
		    	}
		    	done();


			}

		);
	});
});

describe("backand to object", function(){
	it("fetch tables and columns", function(done){
		this.timeout(4000);

		var email = "kornatzky@me.com";
		var password = "secret";
		var appName = "testsql";
		var withDbName = true;

		// get token
		request(

			{
			    url: tokenUrl,
			    
			    method: 'POST',
			   
			    form: {
			        username: email,
			        password: password,
			        appname: appName,
			        grant_type: "password"
			    }
			}, 

			function(error, response, body){
				expect(error).to.equal(null);
				expect(response).to.not.equal(null);
			    if(!error && response.statusCode == 200) {
			    	expect(response.statusCode).to.equal(200);
			    	var b = JSON.parse(body)
			    	var accessToken = b["access_token"];
			    	var tokenType = b["token_type"];
			    	fetchTables(accessToken, tokenType, appName, withDbName, function(err, result){
			    		expect(err).to.equal(null);
			    		expect(result).to.deep.equal(
			    			[
				    			{ 
				    				name: 'items',
	    							fields: 
	    						{ name: { type: 'string' }, description: { type: 'string' } },
	   								items: 'items' 
	   							}
   							]
   						);
			    		
			    		done();
			    	});
			    }
			    else{
			    	expect(error).to.equal(null);
			    	expect(response).to.not.equal(null);
			    	if (response){
			    		expect(response.statusCode).to.equal(400);
			    	}
			    	done();
			    }
			}

		);

	});

});