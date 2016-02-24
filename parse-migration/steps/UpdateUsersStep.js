/**
 * Created by Dell on 2/2/2016.
 */

var self = this;
var q = require('q');
function UpdateUsersStep(statusBl, token) {
    this.statusBl = statusBl;
    this.token = token;
}

UpdateUsersStep.prototype = (function () {
    // Private code here
    var getUpdateStatements = function () {
        return "update `users` set `email` = if(`username` REGEXP '^[^@]+@[^@]+\.[^@]{2,}$', `username`, concat(`username`, '@parse.com')) where email is null;" +
            "update `users` set `firstName` = SUBSTRING_INDEX(SUBSTRING_INDEX(`email`, '@', 1), ' ', -1) " +
            "where email is not null and firstName is null;" +
            "update `users` set `lastName` = SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(`email`, '@', -1), '.', -2), '.', 1) " +
            "where email is not null and lastName is null;"

    };

    return {

        constructor: UpdateUsersStep,

        run: function (bulkRunner, callback) {
            var self = this;
            var sql = getUpdateStatements();
            bulkRunner.update(sql, function (err) {
                callback(err);
            }, function () {
                self.statusBl.restoreUserTable(self.token, callback);
            });
        }
    }
})();

module.exports = UpdateUsersStep;



