/**
 * Created by Dell on 2/21/2016.
 */


var q = require('q');
var logger = require('../logging/logger').getLogger('updateUsers');

var UserTableCreator = function (BackandSdk, token) {
    this.BackandSdk = BackandSdk;
    this.token = token;

    this.CreateBackandRegisterUser = {
        additionalView: "",
        code: "/* globals\n" +
        "  $http - service for AJAX calls - $http({method:'GET',url:CONSTS.apiUrl %2B '/1/objects/yourObject' , headers: {'Authorization':userProfile.token}});\n" +
        "  CONSTS - CONSTS.apiUrl for Backands API URL\n" +
        "*/\n" +
        "'use strict';\n" +
        "function backandCallback(userInput, dbRow, parameters, userProfile) {\n" +
        "    \n" +
        "        if (parameters.sync)\n" +
        "        return {};\n" +
        "\n" +
        "    var randomPassword = function (length) {\n" +
        "	    if (!length) length = 10;\n" +
        "	    return Math.random().toString(36).slice(-length);\n" +
        "	}\n" +
        "    if (!parameters.password){\n" +
        "        parameters.password = randomPassword();\n" +
        "    }\n" +
        "\n" +
        "    var backandUser = {\n" +
        "        password: parameters.password,\n" +
        "        confirmPassword: parameters.password,\n" +
        "        email: userInput.email,\n" +
        "        firstName: userInput.firstName,\n" +
        "        lastName: userInput.lastName,\n" +
        "        parameters: { 'sync': true }\n" +
        "    };\n" +
        "\n" +
        "    // uncomment if you want to debug \n" +
        "    //console.log(parameters);\n" +
        "\n" +
        "    var x = $http({method:'POST',url:CONSTS.apiUrl %2B '1/user' ,data:backandUser, headers: {'Authorization':userProfile.token, 'AppName':userProfile.app}});\n" +
        "\n" +
        "    // uncomment if you want to return the password and sign in as this user\n" +
        "    //return { password: parameters.password };\n" +
        "    return { };\n" +
        "}\n",
        dataAction: "AfterCreate",
        databaseViewName: "",
        inputParameters: "",
        name: "Create Backand Register User",
        useSqlParser: true,
        viewTable: "14",
        whereCondition: "true",
        workflowAction: "JavaScript"
    };

    this.ValidateBackandRegisterUser = {
        additionalView: "",
        code: "/* globals\n" +
        "  $http - service for AJAX calls - $http({method:'GET',url:CONSTS.apiUrl %2B '/1/objects/yourObject' , headers: {'Authorization':userProfile.token}});\n" +
        "  CONSTS - CONSTS.apiUrl for Backands API URL\n" +
        "*/\n" +
        "'use strict';\n" +
        "function backandCallback(userInput, dbRow, parameters, userProfile) {\n" +
        "	var validEmail = function(email)\n" +
        "    {\n" +
        "        var re = /\\S%2B@\\S%2B\\.\\S%2B/;\n" +
        "        return re.test(email);\n" +
        "    }\n" +
        "\n" +
        "    // write your code here\n" +
        "	if (!userInput.email){\n" +
        "        throw new Error('Backand user must have an email.');\n" +
        "    }\n" +
        "\n" +
        "    if (!validEmail(userInput.email)){\n" +
        "        throw new Error('The email is not valid.');\n" +
        "    }\n" +
        "    if (!userInput.firstName){\n" +
        "        throw new Error('Backand user must have a first name.');\n" +
        "    }\n" +
        "    if (!userInput.lastName){\n" +
        "        throw new Error('Backand user must have a last name.');\n" +
        "    }\n" +
        "}\n",
        dataAction: "BeforeCreate",
        databaseViewName: "",
        inputParameters: "",
        name: "Validate Backand Register User",
        useSqlParser: true,
        viewTable: "14",
        whereCondition: "true",
        workflowAction: "JavaScript"
    };

    this.backandAuthOverride = {
        code: "/* globals\n" +
        "  $http - service for AJAX calls - $http({method:'GET',url:CONSTS.apiUrl %2B '/1/objects/yourObject' , headers: {'Authorization':userProfile.token}});\n" +
        "  CONSTS - CONSTS.apiUrl for Backands API URL\n" +
        "  Config - Global Configuration\n" +
        "*/\n" +
        "'use strict';\n" +
        "function backandCallback(userInput, dbRow, parameters, userProfile) {\n" +
        "	//Example for SSO in OAuth 2.0 standard\n" +
        "	//$http({\"method\":\"POST\",\"url\":\"http://www.mydomain.com/api/token\", \"data\":\"grant_type=password&username=\" + userInput.username + \"&password=\" + userInput.password, \"headers\":{\"Content-Type\":\"application/x-www-form-urlencoded\"}});\n" +
        "\n" +
        "	//Return results of \"allow\" or \"deny\" to override the Backand auth and provide a denied message\n" +
        "	//Return ignore to ignore this fucntion and use Backand default authentication\n" +
        "	//Return additionalTokenInfo that will be added to backand auth result.\n" +
        "	//You may access this later by using the getUserDetails function of the Backand SDK.\n" +
        "	var result = \"ignore\";\n" +
        "	var password = userInput.password;\n" +
        "	var username = userInput.username;\n" +
        "	var hashedPassword = null;\n" +
        "   try{\n" +
        "       // Get the current user from parse users\n" +
        "       var response = $http({\n" +
        "           method: \"GET\",\n" +
        "           url: CONSTS.apiUrl %2B \"/1/objects/users\",\n" +
        "           params: {\n" +
        "               filter: [{\n" +
        "                   fieldName: \"username\",\n" +
        "                   operator:\"equals\",\n" +
        "                   value:username\n" +
        "               }]\n" +
        "           },\n" +
        "           headers: {\"Authorization\": userProfile.token}\n" +
        "       });\n" +
        "       // Get the current user encrypted password\n" +
        "       if (response.data.length == 1 && response.data[0].bcryptPassword){\n" +
        "           hashedPassword = response.data[0].bcryptPassword;\n" +
        "       }\n" +
        "       if (hashedPassword){\n" +
        "           // compare by encrypt this password and the stored encrypted password\n" +
        "           var compare = ParseAuth.compare(password, hashedPassword);\n" +
        "\n" +
        "           if (compare.result == true){\n" +
        "               result = \"allow\";\n" +
        "           }\n" +
        "       }\n" +
        "   }\n" +
        "   catch(err){\n" +
        "       throw new Error(\"Failed to authenticate Parse hashed password \" %2B err);\n" +
        "\n" +
        "   }\n" +
        "\n" +
        "   return {\"result\": result, \"message\":\"\", \"additionalTokenInfo\":{}};\n" +
        "}\n",
        whereCondition: "true"
    };
};


UserTableCreator.prototype.restoreUserTable = function (callback) {
    var self = this;
    var backand = self.BackandSdk;

    console.log('start get users config ');
    backand.basicAuth(self.token)
        .then(function() {
            var data = {
                "usersObjectName" : "users",
                "emailFieldName" : "email",
                "firstNameFieldName" : "firstName",
                "lastNameFieldName" : "lastName",
                "passwordFieldName" : "password"
            }
            return backand.post('/1/user/migrate', data);
        } )
        .then(function () {
            return backand.get('/1/table/config/users', undefined);
        })
        .then(function (result) {
            console.info('finish get users config ');
            if (!result) {
                var msg1 = "no users object";
                callback({message: "no users object"});
                return q.reject(msg1);
            }

            if (!(result.id)) {
                var msg2 = "bad format user " + JSON.stringify(result);
                callback({message: msg2});
                return q.reject(msg2);
            }

            return q.resolve(result);
        })
        .then(function (result) {

            self.CreateBackandRegisterUser.viewTable = result.id;
            self.ValidateBackandRegisterUser.viewTable = result.id;

            console.log('start post Create Backand Register User ');
            return backand.get('/1/businessRule', undefined, [{
                    fieldName: "name",
                    operator: "contains",
                    value: "Create Backand Register User"
                }])
                .then(function (res) {
                    if (res && res.data && res.data.length === 1) {
                        logger.info("Create Backand Register User already exist");
                        return q('undefined');
                    }

                    return backand.post('/1/businessRule', self.CreateBackandRegisterUser);

                });

        })
        .then(function () {
            console.info('finish post Create Backand Register User ');

            console.log('start post Validate Backand Register User ');

            return backand.get('/1/businessRule', undefined, [{
                    fieldName: "name",
                    operator: "contains",
                    value: "Validate Backand Register User"
                }])
                .then(function (res) {

                    if (res && res.data && res.data.length === 1) {
                        logger.info("Validate Backand Register User already exist");
                        return q('undefined');
                    }

                    return backand.post('/1/businessRule', self.ValidateBackandRegisterUser);

                });

        })
        .then(function () {
            console.info('finish post Validate Backand Register User');

            console.log('start update current User ');
            return backand.put('/1/parse/updateCurrentUser', undefined);
        })
        .then(function () {
            console.info('finish update current User ');

            console.log('start getting security action id ');
            return backand.get('/1/action/config/getSecurityActionId?actionName=backandAuthOverride', undefined)
                .then(function (res) {
                    console.info('finish getting security action id ');

                    if (!res) {
                        return q('undefined');
                    }

                    console.log('start update backandAuthOverride');
                    return backand.put('/1/businessRule/' + res.id, self.backandAuthOverride);

                });
        })
        .then(function () {
            console.info('finish update backandAuthOverride ');
            callback();
        })
        .fail(function (err) {
            console.error("fail to post Validate Backand Register User " + JSON.stringify(err));
            console.error(err);
            callback(err);
        });

};


module.exports = UserTableCreator;
