var ParseSchema = require('../../parse-schema');
var expect = require("chai").expect;

const NAME_LIMIT = 32;

var schema = {
    "results": [{
        "className": "SOI",
        "fields": {
            "ACL": {
                "type": "ACL"
            },
            "category": {
                "type": "String"
            },
            "createdAt": {
                "type": "Date"
            },
            "customerName": {
                "type": "String"
            },
            "date": {
                "type": "Date"
            },
            "enteredBy": {
                "type": "Pointer",
                "targetClass": "_User"
            },
            "isActive": {
                "type": "Boolean"
            },
            "location": {
                "type": "String"
            },
            "objectId": {
                "type": "String"
            },
            "serial": {
                "type": "String"
            },
            "updatedAt": {
                "type": "Date"
            }
        }
    },
        {
            "className": "locationList",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "locationName": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "_User",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "authData": {
                    "type": "Object"
                },
                "createdAt": {
                    "type": "Date"
                },
                "email": {
                    "type": "String"
                },
                "emailVerified": {
                    "type": "Boolean"
                },
                "employee": {
                    "type": "Pointer",
                    "targetClass": "Employees"
                },
                "isAdmin": {
                    "type": "Boolean"
                },
                "objectId": {
                    "type": "String"
                },
                "password": {
                    "type": "String"
                },
                "specialAccess": {
                    "type": "Array"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "username": {
                    "type": "String"
                }
            }
        },
        {
            "className": "_Session",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "createdWith": {
                    "type": "Object"
                },
                "expiresAt": {
                    "type": "Date"
                },
                "installationId": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "restricted": {
                    "type": "Boolean"
                },
                "sessionToken": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "user": {
                    "type": "Pointer",
                    "targetClass": "_User"
                }
            }
        },
        {
            "className": "Log",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "objectId": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "TimeClockPunches",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "employee": {
                    "type": "Pointer",
                    "targetClass": "Employees"
                },
                "objectId": {
                    "type": "String"
                },
                "punchOutIn": {
                    "type": "String"
                },
                "relatedPunch": {
                    "type": "Pointer",
                    "targetClass": "TimeClockPunches"
                },
                "relatedTimeCalc": {
                    "type": "Pointer",
                    "targetClass": "TimePunchTimeCalculations"
                },
                "timePunched": {
                    "type": "Date"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "Employees",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "firstName": {
                    "type": "String"
                },
                "lastName": {
                    "type": "String"
                },
                "messages": {
                    "type": "Boolean"
                },
                "objectId": {
                    "type": "String"
                },
                "pinNumber": {
                    "type": "String"
                },
                "roleType": {
                    "type": "Pointer",
                    "targetClass": "Roles"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "TimePunchTimeCalculations",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "employee": {
                    "type": "Pointer",
                    "targetClass": "Employees"
                },
                "objectId": {
                    "type": "String"
                },
                "timePunchedIn": {
                    "type": "Date"
                },
                "timePunchedOut": {
                    "type": "Date"
                },
                "totalTime": {
                    "type": "Number"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "Schedule",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "accountNumber": {
                    "type": "String"
                },
                "aquaDoor": {
                    "type": "Boolean"
                },
                "bringChem": {
                    "type": "Boolean"
                },
                "cancelReason": {
                    "type": "String"
                },
                "confirmedDate": {
                    "type": "Date"
                },
                "confirmedWith": {
                    "type": "String"
                },
                "confrimedBy": {
                    "type": "String"
                },
                "coverType": {
                    "type": "String"
                },
                "createdAt": {
                    "type": "Date"
                },
                "customerAddress": {
                    "type": "String"
                },
                "customerName": {
                    "type": "String"
                },
                "customerPhone": {
                    "type": "String"
                },
                "isActive": {
                    "type": "Boolean"
                },
                "locEssentials": {
                    "type": "String"
                },
                "notes": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "takeTrash": {
                    "type": "Boolean"
                },
                "type": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "weekEnd": {
                    "type": "Date"
                },
                "weekObj": {
                    "type": "Pointer",
                    "targetClass": "ScheduleWeekList"
                },
                "weekStart": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "ScheduleWeekList",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "apptsRemain": {
                    "type": "Number"
                },
                "createdAt": {
                    "type": "Date"
                },
                "isOpenWeek": {
                    "type": "Boolean"
                },
                "maxAppts": {
                    "type": "Number"
                },
                "numApptsSch": {
                    "type": "Number"
                },
                "objectId": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "weekEnd": {
                    "type": "Date"
                },
                "weekStart": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "Roles",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "objectId": {
                    "type": "String"
                },
                "roleName": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "_Role",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "name": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "roles": {
                    "type": "Relation",
                    "targetClass": "_Role"
                },
                "updatedAt": {
                    "type": "Date"
                },
                "users": {
                    "type": "Relation",
                    "targetClass": "_User"
                }
            }
        },
        {
            "className": "Messages",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "altPhone": {
                    "type": "String"
                },
                "createdAt": {
                    "type": "Date"
                },
                "dateEntered": {
                    "type": "Date"
                },
                "dateTimeMessage": {
                    "type": "Date"
                },
                "emailAddy": {
                    "type": "String"
                },
                "messageFromAddress": {
                    "type": "String"
                },
                "messageFromName": {
                    "type": "String"
                },
                "messageFromPhone": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "recipient": {
                    "type": "Pointer",
                    "targetClass": "Employees"
                },
                "signed": {
                    "type": "Pointer",
                    "targetClass": "_User"
                },
                "status": {
                    "type": "String"
                },
                "statusTime": {
                    "type": "Date"
                },
                "theMessage": {
                    "type": "String"
                },
                "unread": {
                    "type": "Boolean"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "_Installation",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "GCMSenderId": {
                    "type": "String"
                },
                "appIdentifier": {
                    "type": "String"
                },
                "appName": {
                    "type": "String"
                },
                "appVersion": {
                    "type": "String"
                },
                "badge": {
                    "type": "Number"
                },
                "channels": {
                    "type": "Array"
                },
                "createdAt": {
                    "type": "Date"
                },
                "deviceToken": {
                    "type": "String"
                },
                "deviceType": {
                    "type": "String"
                },
                "employee": {
                    "type": "Pointer",
                    "targetClass": "Employees"
                },
                "installationId": {
                    "type": "String"
                },
                "localeIdentifier": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "parseVersion": {
                    "type": "String"
                },
                "pushType": {
                    "type": "String"
                },
                "timeZone": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "MessageNotes",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "createdAt": {
                    "type": "Date"
                },
                "note": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "pointerMessage": {
                    "type": "Pointer",
                    "targetClass": "Messages"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        },
        {
            "className": "CustomerData",
            "fields": {
                "ACL": {
                    "type": "ACL"
                },
                "accountNumber": {
                    "type": "String"
                },
                "addressCity": {
                    "type": "String"
                },
                "addressState": {
                    "type": "String"
                },
                "addressStreet": {
                    "type": "String"
                },
                "addressZIP": {
                    "type": "String"
                },
                "createdAt": {
                    "type": "Date"
                },
                "currentBalance": {
                    "type": "Number"
                },
                "customerOpened": {
                    "type": "Date"
                },
                "firstName": {
                    "type": "String"
                },
                "fullName": {
                    "type": "String"
                },
                "lastName": {
                    "type": "String"
                },
                "objectId": {
                    "type": "String"
                },
                "phoneNumber": {
                    "type": "String"
                },
                "updatedAt": {
                    "type": "Date"
                }
            }
        }]
}

describe('schema validation', function(){
    it('table with long name get smaller name', function(done){
        var parseSchema = new ParseSchema(schema.results);

        var className = "TimePunchTimeCalculations";
        expect(parseSchema.getClass(className)).to.not.be.null;

        // act
        parseSchema.adjustNames();

        expect(parseSchema.getClass(className)).to.be.a('null');

        expect(parseSchema.getClass(className.substr(0, NAME_LIMIT/2))).to.not.be.a('null');

        var changed = parseSchema.getAdjustedNames();

        done();
    })

    it('column with long name get smaller name', function(done){
        var fieldName = "VERYLONGCOLUMNVERYLONGCOLUMN123456";
        schema.results.push({
            "className": "test2",
            "fields": {
                "VERYLONGCOLUMNVERYLONGCOLUMN123456": {
                    "type": "string"
                }
            }
        });
        var parseSchema = new ParseSchema(schema.results);


        // act
        parseSchema.adjustNames();
        expect(parseSchema.getClass('test2').fields[fieldName]).to.be.an('undefined');

        expect(parseSchema.getClass('test2').fields[fieldName.substr(0, NAME_LIMIT)]).to.be.an('object');

        var changed = parseSchema.getAdjustedNames();

        done();
    })

    it('two columns with long name get smaller name with num', function(done){
        schema.results.push({
            "className": "test3",
            "fields": {
                "VERYLONGCOLUMNVERYLONGCO12345678LUMN": {
                    "type": "string"
                },
                "VERYLONGCOLUMNVERYLONGCO12345678LUMN2": {
                    "type": "string"
                }
            }
        });
        var parseSchema = new ParseSchema(schema.results);


        // act
        parseSchema.adjustNames();
        expect(parseSchema.getClass('test3').fields["VERYLONGCOLUMNVERYLONGCO12345678LUMN"]).to.be.an('undefined');

        expect(parseSchema.getClass('test3').fields["VERYLONGCOLUMNVERYLONGCO12345678"]).to.be.an('object');
        expect(parseSchema.getClass('test3').fields["VERYLONGCOLUMNVERYLONGCO12345671"]).to.be.an('object');

        var changed = parseSchema.getAdjustedNames();

        done();
    })

    it('two tables with long name get smaller name with num', function(done){
        schema.results.push({
            "className": "VERYLONGCLASSVERYLONGCLA12345678SS",
            "fields": {

            }
        });

        schema.results.push({
            "className": "VERYLONGCLASSVERYLONGCLA12345678SS2314152346467756",
            "fields": {

            }
        });
        var parseSchema = new ParseSchema(schema.results);


        // act
        parseSchema.adjustNames();
        expect(parseSchema.getClass('VERYLONGCLASSVERYLONGCLA12345678SS')).to.be.a('null');

        expect(parseSchema.getClass('VERYLONGCLASSVERYLONGCLA12345678')).to.be.an('object');
        expect(parseSchema.getClass('VERYLONGCLASSVERYLONGCLA12345671')).to.be.an('object');

        var changed = parseSchema.getAdjustedNames();

        done();
    })


    it('two classes with long name in table and cloumn get 12 letters names ', function(done){
        schema.results.push({
            "className": "sample",
            "fields": {
                "verylongfield1231312312": {
                    "type": "Pointer",
                    "targetClass": "ANOTTHERVERYLONGCLASS"
                }
            }
        });

        schema.results.push({
            "className": "ANOTTHERVERYLONGCLASS",
            "fields": {

            }
        });
        var parseSchema = new ParseSchema(schema.results);


        // act
        parseSchema.adjustNames();


        expect(parseSchema.getClass('sample').fields['verylongfield12']).to.be.an('object');
        expect(parseSchema.getClass('sample').fields['verylongfield12'].targetClass).to.be.equal('ANOTTHERVERYLONG');
        done();
    })
})

