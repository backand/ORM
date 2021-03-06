var expect = require("chai").expect;

var request = require('request');
var request_json = require('request-json');
var _ = require('underscore');

var validator = require("../validate_schema.js").validator;
var transformer = require("../transform.js").transformer;
var connectionInfo = require("../get_connection_info");
var fetchTables = require("../backand_to_object").fetchTables;

var api_url = require('../configFactory').getConfig().api_url;
var tokenUrl = api_url + "/token";

var client = request_json.createClient('http://localhost:9000/');


describe("validate", function () {
    it("disallow columns with dashes", function (done) {
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
                warnings: ['relation: user column:na-me - column name should contain only alphanumeric characters and underscore']
            }
        );
        done();
    });

    it("schema with relationships cannot require relationship columns, n:m relationships not allowed", function (done) {
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
                        "dogs": {
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
                        "owner": {
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
                        "dogs": {
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
                        "owners": {
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

    it("declare valid schema with relationships", function (done) {
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

    it("tables with n:m relationships are not allowed", function (done) {
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

    it("defalt values of columns are of the right type", function (done) {
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
                        dogs: {
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
                        owner: {
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

    it("multiple 1:n relationships between two relations", function (done) {
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
                        dogs: {
                            collection: 'animal',
                            via: 'catOwner'
                        },
                        cats: {
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
                        dogOwner: {
                            object: 'person'
                        },
                        catOwner: {
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

describe("transform", function () {
    it("create schema with no relationships", function (done) {
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

    it("create schema with required columns", function (done) {
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

    it("create schema with default values for columns", function (done) {
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
                "alter": ["create table `R` (`id` int unsigned not null auto_increment primary key, `A` decimal(50, 2) default '20', `B` varchar(255) not null)"],

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

    it("create schema with 1:n relationships", function (done) {
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
                    "create table `R` (`id` int unsigned not null auto_increment primary key, `a` decimal(50, 2), `b` varchar(255))",
                    "create table `U` (`id` int unsigned not null auto_increment primary key, `c` decimal(50, 2), `d` varchar(255), `owner` int unsigned)",
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

    it("drop columns", function (done) {
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
                    "alter table U drop foreign key r_owner_bkname_dogs",
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

    it("drop table involved in 1:n relationships", function (done) {
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
                    "create table `U1` (`id` int unsigned not null auto_increment primary key, `c` decimal(50, 2), `d` varchar(255), `owner` int unsigned)",
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

    it("rename columnn used in 1:n relationship", function (done) {
        var v = transformer(
            [
                {
                    "name": "task",
                    "fields": {
                        "owner": {
                            "object": "users"
                        },
                        "description": {
                            "type": "string"
                        },
                        "completed": {
                            "type": "boolean"
                        }
                    }
                },
                {
                    "name": "users",
                    "fields": {
                        "task": {
                            "collection": "task",
                            "via": "owner"
                        },
                        "email": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        },
                        "role": {
                            "type": "string"
                        }
                    }
                }
            ],
            [
                {
                    "name": "task",
                    "fields": {
                        "created_by": {
                            "object": "users"
                        },
                        "description": {
                            "type": "string"
                        },
                        "completed": {
                            "type": "boolean"
                        }
                    }
                },
                {
                    "name": "users",
                    "fields": {
                        "task": {
                            "collection": "task",
                            "via": "created_by"
                        },
                        "email": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        },
                        "role": {
                            "type": "string"
                        }
                    }
                }
            ], 0
        );
        expect(v).to.deep.equal(
            {
                "alter": [
                    "alter table task drop foreign key users_owner_bkname_task",
                    "alter table `task` add `created_by` int unsigned",
                    "alter table `task` drop `owner`",
                    "alter table `task` add constraint users_created_by_bkname_task foreign key (`created_by`) references `users` (`id`) on update cascade on delete cascade"
                ],

                "notifications": {
                    "droppedColumns": [
                        {
                            "column": "owner",
                            "table": "task"
                        }
                    ]
                },

                "order": {
                    "columns": {
                        "task": [
                            "created_by",
                            "description",
                            "completed",
                        ],
                        "users": [
                            "task",
                            "email",
                            "name",
                            "role",
                        ]
                    },

                    "tables": [
                        "task",
                        "users"
                    ]
                },

                valid: "always",
                warnings: []
            }
        );
        done();
    });

    it("handle fields in camel case", function (done) {
        var v = transformer(
            [],
            [
                {
                    "name": "task",
                    "fields": {
                        "createdBy": {
                            "object": "users"
                        },
                        "description": {
                            "type": "string"
                        },
                        "completed": {
                            "type": "boolean"
                        }
                    }
                },
                {
                    "name": "users",
                    "fields": {
                        "task": {
                            "collection": "task",
                            "via": "createdBy"
                        },
                        "email": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        },
                        "role": {
                            "type": "string"
                        }
                    }
                }
            ]
            , 0
        );
        expect(v).to.deep.equal(
            {
                "alter": [
                    "create table `task` (`id` int unsigned not null auto_increment primary key, `createdBy` int unsigned, `description` varchar(255), `completed` bit(1))",
                    "create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255), `name` varchar(255), `role` varchar(255))",
                    "alter table `task` add constraint users_createdby_bkname_task foreign key (`createdBy`) references `users` (`id`) on update cascade on delete cascade"
                ],

                "notifications": {},

                "order": {
                    "columns": {
                        "task": [
                            "createdBy",
                            "description",
                            "completed",
                        ],
                        "users": [
                            "task",
                            "email",
                            "name",
                            "role",
                        ]
                    },

                    "tables": [
                        "task",
                        "users"
                    ]
                },

                valid: "always",
                warnings: []
            }
        );
        done();
    });

    it("no error in update schema", function (done) {
        var v = transformer(
            [
                {
                    "name": "users",
                    "fields": {
                        "friend_proposals": {
                            "collection": "friend_request",
                            "via": "target_user"
                        },
                        "email": {
                            "type": "string"
                        },
                        "public_name": {
                            "type": "string"
                        },
                        "public_avatar": {
                            "type": "string"
                        },
                        "public_sex": {
                            "type": "string"
                        },
                        "public_status": {
                            "type": "string"
                        },
                        "private_name": {
                            "type": "string"
                        },
                        "private_avatar": {
                            "type": "string"
                        },
                        "private_sex": {
                            "type": "string"
                        },
                        "private_status": {
                            "type": "string"
                        },
                        "checkins": {
                            "collection": "checkin",
                            "via": "user"
                        },
                        "friend_requests": {
                            "collection": "friend_request",
                            "via": "user"
                        }
                    }
                },
                {
                    "name": "place",
                    "fields": {
                        "name": {
                            "type": "string"
                        },
                        "cover": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        },
                        "checkins": {
                            "collection": "checkin",
                            "via": "place"
                        }
                    }
                },
                {
                    "name": "checkin",
                    "fields": {
                        "user": {
                            "object": "users"
                        },
                        "place": {
                            "object": "place"
                        },
                        "start_time": {
                            "type": "datetime"
                        }
                    }
                },
                {
                    "name": "friend_request",
                    "fields": {
                        "target_user": {
                            "object": "users"
                        },
                        "user": {
                            "object": "users"
                        },
                        "init_user": {
                            "type": "float"
                        }
                    }
                }
            ]
            ,

            [
                {
                    "name": "users",
                    "fields": {
                        "friend_proposals": {
                            "collection": "friend_request",
                            "via": "target_user"
                        },
                        "friend_request": {
                            "collection": "friend_request",
                            "via": "init_user"
                        },
                        "email": {
                            "type": "string"
                        },
                        "public_name": {
                            "type": "string"
                        },
                        "public_avatar": {
                            "type": "string"
                        },
                        "public_sex": {
                            "type": "string"
                        },
                        "public_status": {
                            "type": "string"
                        },
                        "private_name": {
                            "type": "string"
                        },
                        "private_avatar": {
                            "type": "string"
                        },
                        "private_sex": {
                            "type": "string"
                        },
                        "private_status": {
                            "type": "string"
                        },
                        "checkins": {
                            "collection": "checkin",
                            "via": "user"
                        }
                    }
                },
                {
                    "name": "place",
                    "fields": {
                        "name": {
                            "type": "string"
                        },
                        "cover": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        },
                        "checkins": {
                            "collection": "checkin",
                            "via": "place"
                        }
                    }
                },
                {
                    "name": "checkin",
                    "fields": {
                        "user": {
                            "object": "users"
                        },
                        "place": {
                            "object": "place"
                        },
                        "start_time": {
                            "type": "datetime"
                        }
                    }
                },
                {
                    "name": "friend_request",
                    "fields": {
                        "target_user": {
                            "object": "users"
                        },
                        "init_user": {
                            "object": "users"
                        }
                    }
                }
            ]


            , 0
        );
        expect(v).to.deep.equal(
            {
                "alter": [
                    "alter table friend_request drop foreign key users_user_bkname_friend_requests",
                    "alter table `friend_request` drop `user`",
                    "alter table `friend_request` add `init_user` int unsigned\nalter table `friend_request` add constraint friend_request_init_user_foreign foreign key (`init_user`) references `users` (`id`) on update cascade on delete cascade"
                ],
                "valid": "never",
                "warnings": [
                    {
                        "column": "init_user",
                        "kind": "conversion between type and relationship",
                        "newType": "relation",
                        "oldType": "float",
                        "relation": "friend_request",
                    }
                ],
                "notifications": {
                    "droppedColumns": [
                        {
                            "column": "friend_requests",
                            "table": "users"
                        },
                        {
                            "column": "user",
                            "table": "friend_request"
                        }
                    ]
                },
                "order": {
                    "columns": {
                        "checkin": [
                            "user",
                            "place",
                            "start_time"
                        ],
                        "friend_request": [
                            "target_user",
                            "init_user"
                        ],
                        "place": [
                            "name",
                            "cover",
                            "description",
                            "checkins",
                        ],
                        "users": [
                            "friend_proposals",
                            "friend_request",
                            "email",
                            "public_name",
                            "public_avatar",
                            "public_sex",
                            "public_status",
                            "private_name",
                            "private_avatar",
                            "private_sex",
                            "private_status",
                            "checkins"
                        ]
                    },
                    "tables": [
                        "users",
                        "place",
                        "checkin",
                        "friend_request"
                    ]
                },
                "valid": "always",
                "warnings": []
            }
        );
        done();
    });

    it("two parallel relationships", function (done) {
        var v = transformer(
            [
                {
                    "name": "user",
                    "fields": {
                        "userName": {"type": "string", "required": true},
                        "tasks": {"collection": "task", "via": "owner"}
                    }
                },
                {
                    "name": "categorization",
                    "fields": {
                        "task_Id": {"object": "task"},
                        "tag_Id": {"object": "tag"},
                        "taskId": {"type": "float"},
                        "tagId": {"type": "float"}
                    }
                },
                {
                    "name": "tag",
                    "fields": {
                        "categorization": {"collection": "categorization", "via": "tag_Id"},
                        "name": {"type": "string"}
                    }
                },
                {
                    "name": "task",
                    "fields": {
                        "categorization": {"collection": "categorization", "via": "task_Id"},
                        "title": {"type": "string", "required": true},
                        "description": {"type": "string"},
                        "completed": {"type": "boolean", "required": true},
                        "owner": {"object": "user"}
                    }
                }
            ],
            [
                {
                    "name": "user",
                    "fields": {
                        "userName": {"type": "string", "required": true}
                    }
                }
            ],


            0
        );
        expect(v).to.deep.equal(
            {


                "alter": [
                    "alter table categorization drop foreign key task_task_id_bkname_categorization",
                    "alter table categorization drop foreign key tag_tag_id_bkname_categorization",
                    "drop table `categorization`",
                    "drop table `tag`",
                    "drop table `task`"
                ],
                "valid": "never",
                "warnings": [],
                "notifications": {
                    "droppedTables": ["categorization", "tag", "task"],
                    "droppedColumns": [{"table": "user", "column": "tasks"}]
                },
                "order": {"tables": ["user"], "columns": {"user": ["userName"]}},
                "valid": "always",
                "warnings": []
            }
        );
        done();
    });

    it("drop object with relation", function (done) {
        var v = transformer(
           [{
                "name": "items",
                "fields": {"name": {"type": "string"}, "description": {"type": "text"}, "user": {"object": "users"}}
            }, {
                "name": "users",
                "fields": {
                    "items": {"collection": "items", "via": "user"},
                    "email": {"type": "string"},
                    "firstName": {"type": "string"},
                    "lastName": {"type": "string"}
                }
            }],
            [{
                "name": "Story",
                "fields": {
                    "title": {"type": "string"},
                    "description": {"type": "text"},
                    "user": {"object": "User"},
                    "run": {"object": "Run"}
                }
            }, {
                "name": "User",
                "fields": {
                    "Run": {"collection": "Run", "via": "user"},
                    "stories": {"collection": "Story", "via": "user"},
                    "email": {"type": "string"},
                    "firstName": {"type": "string"},
                    "lastName": {"type": "string"},
                    "birthday": {"type": "datetime"},
                    "sex": {"type": "boolean"}
                }
            }, {
                "name": "Run",
                "fields": {
                    "Story": {"collection": "Story", "via": "run"},
                    "name": {"type": "string"},
                    "date": {"type": "datetime"},
                    "user": {"object": "User"},
                    "location": {"object": "Location"}
                }
            }, {
                "name": "Location",
                "fields": {
                    "Run": {"collection": "Run", "via": "location"},
                    "numDepartement": {"type": "string"},
                    "nameDepartement": {"type": "string"},
                    "town": {"type": "string"}
                }
            }, {"name": "Post", "fields": {"title": {"type": "string"}, "content": {"type": "string"}}}]
            ,

            0
        )
        ;
        expect(v).to.deep.equal(
            {

                "alter": [
                    "alter table items drop foreign key users_user_bkname_items",
                    "drop table `items`",
                    "drop table `users`",
                    "create table `Story` (`id` int unsigned not null auto_increment primary key, `title` varchar(255), `description` text, `user` int unsigned, `run` int unsigned)",
                    "create table `User` (`id` int unsigned not null auto_increment primary key, `email` varchar(255), `firstName` varchar(255), `lastName` varchar(255), `birthday` datetime, `sex` bit(1))",
                    "create table `Run` (`id` int unsigned not null auto_increment primary key, `name` varchar(255), `date` datetime, `user` int unsigned, `location` int unsigned)",
                    "create table `Location` (`id` int unsigned not null auto_increment primary key, `numDepartement` varchar(255), `nameDepartement` varchar(255), `town` varchar(255))",
                    "create table `Post` (`id` int unsigned not null auto_increment primary key, `title` varchar(255), `content` varchar(255))",
                    "alter table `Story` add constraint user_user_bkname_stories foreign key (`user`) references `User` (`id`) on update cascade on delete cascade",
                    "\nalter table `Story` add constraint run_run_bkname_story foreign key (`run`) references `Run` (`id`) on update cascade on delete cascade",
                    "alter table `Run` add constraint user_user_bkname_run foreign key (`user`) references `User` (`id`) on update cascade on delete cascade",
                    "\nalter table `Run` add constraint location_location_bkname_run foreign key (`location`) references `Location` (`id`) on update cascade on delete cascade"
                ],
                "valid": "never",
                "warnings": [],
                "notifications": {
                    "droppedTables": ["items", "users"],

                },
                "order": {"columns": {
                    "Location": [
                        "Run",
                        "numDepartement",
                        "nameDepartement",
                        "town"
                    ],
                    "Post": [
                        "title",
                        "content",
                    ],
                    "Run": [
                        "Story",
                        "name",
                        "date",
                        "user",
                        "location",
                    ],
                    "Story": [
                        "title",
                        "description",
                        "user",
                        "run"
                    ],
                    "User": [
                        "Run",
                        "stories",
                        "email",
                        "firstName",
                        "lastName",
                        "birthday",
                        "sex"
                    ]
                },
                    "tables": [
                        "Story",
                        "User",
                        "Run",
                        "Location",
                        "Post"
                    ]},
                "valid": "always",
                "warnings": []
            }
        );
        done();
    });

});

describe("get connection info", function () {
    it("get connection info with correct credentials", function (done) {
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

            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var b = JSON.parse(body)
                    var accessToken = b["access_token"];
                    var tokenType = b["token_type"];

                    connectionInfo.getConnectionInfo(accessToken, tokenType, appName, function (err, result) {
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
                else {
                    expect(error).to.equal(null);
                    expect(response).to.not.equal(null);
                    if (response) {
                        expect(response.statusCode).to.equal(200);
                    }
                    done();

                }
            }
        );
    });

    it("do not authorize getting connection info with wrong credentials", function (done) {
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

            function (error, response, body) {

                expect(error).to.equal(null);
                expect(response).to.not.equal(null);
                if (response) {
                    expect(response.statusCode).to.equal(400);
                }
                done();


            }
        );
    });
});

describe("backand to object", function () {
    it("fetch tables and columns", function (done) {
        this.timeout(4000);

        var email = "kornatzky@me.com";
        var password = "secret";
        var appName = "testsql";
        var withDbName = true;
        var withIdColumn = false;

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

            function (error, response, body) {
                expect(error).to.equal(null);
                expect(response).to.not.equal(null);
                if (!error && response.statusCode == 200) {
                    expect(response.statusCode).to.equal(200);
                    var b = JSON.parse(body)
                    var accessToken = b["access_token"];
                    var tokenType = b["token_type"];
                    fetchTables(accessToken, tokenType, appName, withDbName, withIdColumn, function (err, result) {
                        expect(err).to.equal(null);
                        expect(result).to.deep.equal(
                            [
                                {
                                    name: 'items',
                                    dbName: "items",
                                    fields: {
                                        name: {
                                            type: 'string',
                                            "dbName": "name"
                                        },
                                        description: {
                                            type: 'string',
                                            "dbName": "description"
                                        }
                                    }
                                }
                            ]
                        );

                        done();
                    });
                }
                else {
                    expect(error).to.equal(null);
                    expect(response).to.not.equal(null);
                    if (response) {
                        expect(response.statusCode).to.equal(400);
                    }
                    done();
                }
            }
        );

    });

});

describe("test smartListFolder call", function() {
    before(function (done) {
       var data = {
            bucket: "files.backand.net",
            folder: "qa13101"
        };
    
        client.post('deleteFolder', data, function(err, res, body) {
            expect(res.statusCode).to.be.equal(200);
            done();
        });
    })
    it("catch files returned", function (done) {

        this.timeout(20000);
        var data = {
            bucket: "files.backand.net",
            folder: "qa13101"
        };
        client.post('smartListFolder', data, function(err, res, body) {
            expect(err).to.be.null;
            expect(res.statusCode).to.be.equal(200);
            expect(body.length).to.be.above(1);
            done();
        });
    })
})