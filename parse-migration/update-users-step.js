/**
 * Created by Dell on 2/2/2016.
 */


var self = this;

function UpdateUsersStep() {
}

UpdateUsersStep.prototype = (function() {
    // Private code here
    var getUpdateStatements = function() {
        return "update `users` set `email` = `username` where email is null;update `users` set `email` = `username` where email is null;";
    };

    return {

        constructor:UpdateUsersStep,

        run:function(bulkRunner, callback) {
            try {
                var sql = getUpdateStatements();
                bulkRunner.update(sql, function(err){
                    callback(err);
                }, function(){
                    callback();
                })
            }
            catch(err){
                callback({
                    js: "PointerConverter",
                    func: "getUpdateStatementsForAllPointer",
                    className: className,
                    objectId: jsonFromParse.objectId,
                    column: property,
                    message: "Parse to MySQL transformation error",
                    internalError: err
                });
            }

        }

    };
})();

module.exports = UpdateUsersStep;



