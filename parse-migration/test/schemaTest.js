var ParseSchema = require('../parse-schema');

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

function test(){
    var parseSchema = new ParseSchema(schema.results);
    parseSchema.adjustNames();
    console.log(JSON.stringify(parseSchema.getAdjustedNames()));
    console.log(JSON.stringify(schema));
}

test();