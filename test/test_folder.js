/**
 * Created by Dell on 6/15/2017.
 */
var folder = require('../list-s3/folder');

folder.rename('files.backand.net', 'testRename2', 'testRename3', function(err,data){
    if (err) console.error(err);
    else console.log(data);
})