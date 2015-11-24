1. Require

	var gulp = require('gulp');
	var backandSync = require('../sync-module');

2. Set credentials. Credentials will be stored in file `temporary-credentials.json`

	gulp.task('sts', function(){
	    var masterToken = "1a1c664c-a3e5-4db8-bf89-1ed79a78950e"; // master Backand token
	    var userToken = "2b626399-8650-11e5-b5b9-12da56281408"; // user Backand token
	    return backandSync.sts(masterToken, userToken);
	});

3. Sync folder `./src`

	gulp.task('dist', function() {   
	    var folder = "./src";
		return backandSync.dist(folder);
	});

4. Syncing is done via local cache file `.awspublish-<bucketname>`. Repeated add/delete of the same file may confuse it. To clean the cache do:

	gulp.task('clean', function() {
		return backandSync.clean();
	});