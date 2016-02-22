/**
 * Created by Dell on 2/21/2016.
 */


var q = require('q');

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
    }
}


UserTableCreator.prototype.restoreUserTable = function (callback) {
    var self = this;
    var backand = self.BackandSdk;

    console.log('start get users config ');
    backand.basicAuth(self.token)
        .then(function() { return backand.get('/1/table/config/users', undefined) } )
        .then(function (result) {
            console.info('finish get users config ');
            if (!result) {
                var msg = "no users object";
                callback({message: "no users object"});
                return q.reject(msg);
            }

            if (!(result.id)) {
                var msg = "bad format user " + JSON.stringify(result);
                callback({message: msg});
                return q.reject(msg);
            }

            return q.resolve(result);
        })
        .then(function (result) {

            self.CreateBackandRegisterUser.viewTable = result.id;
            self.ValidateBackandRegisterUser.viewTable = result.id;

            console.log('start post Create Backand Register User ');
            return backand.post('/1/businessRule', self.CreateBackandRegisterUser);
        })
        .then(function () {
            console.info('finish post Create Backand Register User ');

            console.log('start post Validate Backand Register User ');
            return backand.post('/1/businessRule', self.ValidateBackandRegisterUser);
        })
        .then(function () {
            console.info('finish post Validate Backand Register User');

            console.log('start update current User ');
            return backand.put('/1/parse/updateCurrentUser', undefined);
        })
        .then(function () {
            console.info('finish update current User ');
            callback();
            return;
        })
        .fail(function (err) {
            console.error("fail to post Validate Backand Register User");
            console.error(err);
            callback(err);
        })

}


module.exports = UserTableCreator;
