var gulp = require('gulp');
var backandSync = require('backand-sync-s3');


gulp.task('sts', function(){
    var username = "1a1c664c-a3e5-4db8-bf89-1ed79a78950e";
    var password = "2b626399-8650-11e5-b5b9-12da56281408";
    return backandSync.sts(username, password);
});



// erase deleted files. upload new and changes only
gulp.task('dist', function() {   
    var folder = "./src";
	return backandSync.dist(folder);
});

// clean cache of gulpfile if it gets confused about delete/insert of same file in same bucket
gulp.task('clean', function() {
	return backandSync.clean();
});