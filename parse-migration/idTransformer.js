/**
 * Created by backand on 2/11/16.
 * This module create a guid from ObjectId of parse
 * Parse create id's with this function:
 *
 *      // Returns a string that's usable as an object id.
 // Probably unique. Good enough? Probably!
 function newObjectId() {
         var chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                      'abcdefghijklmnopqrstuvwxyz' +
                      '0123456789');
         var objectId = '';
         for (var i = 0; i < 10; ++i) {
           objectId += chars[Math.floor(Math.random() * chars.length)];
         }
         return objectId;
        }
 The algorithm we are using assume that objectId length is 10.
 So we can take hex representation of every char,
 and get a string with length of 20.
 After that we pad the string to arrive to 32 length,
 and format it with dashes like guid.
 {8}-{4}-{4}-{4}-{12}

 Thanks for Itay to found this algo.
 */

function string_as_unicode_escape(input) {
    var u = (input.charCodeAt(0).toString(16));
    return u;

}
function formatAsGuid(str) {
    var parts = [];
    parts.push(str.slice(0, 8));
    parts.push(str.slice(8, 12));
    parts.push(str.slice(12, 16));
    parts.push(str.slice(16, 20));
    parts.push(str.slice(20, 32));
    var GUID = parts.join('-');

    return GUID;
}

function toGuidId(str) {
    if (str.length > 16) {
        throw new Error("can't parse string with more than 16 chars");
    }

    // chaange to ascii -> hex -> join
    // format 8-4-4-4-12
    var res = "";

    for (var x = 0; x < str.length; x++)
    {
        var c = str.charAt(x);
        res += string_as_unicode_escape(c);
    }

    // pad with zero to be sure we have 32
    res = String("00000000000000000000000000000000" + res).slice(-32);
    res = formatAsGuid(res);
    console.log("toGuidId finsish", str, res);
    return res;

}

function idTranstormer() {

}

idTranstormer.prototype.toGuidId = toGuidId;

module.exports = new idTranstormer();

//
//console.log(toGuidId('NaPEZM3BMe'));
//console.log(toGuidId('asdhjkiuhj'));
//console.log(toGuidId('zzzzzzzzzz'));
//console.log(toGuidId('zzzzzzzzzz'));
//console.log(toGuidId('asdasdasd'));
