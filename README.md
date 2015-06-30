Installaiton
=============
1. npm i
2. npm install -g node-windows : For the windows service registration
3. npm link node-windows
4. open cmd as Administartor
5. node runSchemaServerAsAService.js - Make sure the path in the file match the location


Transform
=========
Create SQL script to transform one schema to another.

Call as:

    transform(oldSchema, newSchema, severity)

Obtains two JSON schemes: 

* `oldSchema` - json
* `newSchema` - json

* `severity` - 
    1. 0 - validate transform based on schemes only
    2. 1 - validate transform based on schemes and current data 

Returns: json wih three fields:
 
 
1. valid: string - "always" - perfectly valid, "data" - valid with warnings, depends on actual data, "never" - invalid,
2. warnings: <array of strings of warnings/errors>
3. alter: <array of strings of SQL statements to alter schema>

Validate
========
Test if a JSON schema is valid.

Call as:

    validateSchema(str)

Obtains:

* `str` - string representing schema in JSON 

Returns: json wih two fields:
 
1. valid: boolean
2. warnings: <array of strings of warnings/errors>

Schema Server
=============
You can test calls using [http-console](https://github.com/cloudhead/http-console)

    http-console --json http://localhost:8080

To make a POST call:

    post transform
    { "oldSchema": [], "newSchema": [], "severity": 1 }

Fill the oldSchema and newSchema as desired.




