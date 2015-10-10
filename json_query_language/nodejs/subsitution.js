module.exports.subsitute = substitute;

var _ = require('underscore');

var leftEncloseVariable = "{{";
var rightEncloseVariable = "}}";

/** @function
 * @name substitute
 * @description give sql query string with variables
 * marked by enclosing in enclose characters, subsitute the values in the assignment hash
 * @param {string} str - sql query
 * @param {object} assignment - hash of variable names into values. Variables are the keys of the hash. 
 * @param {string} sql statement after susbsitution
 */

function substitute(str, assignment){
	var modStr = str;
	_.each(assignment, function(value, key){
		if (_.isString(value)){
			v = "'" + value + "'";
		}
		else{
			v = value;
		}
		modStr = modStr.replace(new RegExp(key, "g"), v);
	});
	return modStr;
}

// console.log(substitute("SELECT `blabla`.`GROUP_CONCAT(Location)`,`blabla`.`country` FROM `blabla` WHERE (( `blabla`.`Budget` > {{x}} ) OR ( `blabla`.`Location` LIKE {{yyy}} )) GROUP BY `blabla`.`country` ORDER BY `blabla`.`X` asc , `blabla`.`Budget` desc  UNION SELECT `Person`.`City`,`Person`.`country` FROM `Person` WHERE (`Person`.`name` = {{yyy}})   LIMIT 11",
// {
// 	'{{x}}': 800,
// 	'{{yyy}}': 'Tel Aviv'
// }

// 	));