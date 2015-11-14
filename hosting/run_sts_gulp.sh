#!/bin/bash

if node sts.js; then
	if node_modules/gulp/bin/gulp.js dist --f ./dist --b hosting.backand.net --d k1; then
    	echo "Command succeeded"
    else 
    	echo "Command failed"
    fi
else
    echo "Command failed"
fi