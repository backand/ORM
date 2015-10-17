var gulp = require('gulp');
var markdown = require('gulp-markdown');
var fs = require('fs');
var del = require('del');
var rename = require("gulp-rename");
var moment = require('moment');
var del = require('del');
var replace = require('gulp-replace');
var shell = require('gulp-shell')

// clean posts and images folders of site
gulp.task('clean-jekyll', function () {
  return del([
    '../static_site/tmp/*',
    '../static_site/_posts/*',
    '../static_site/_posts/**/*',
    '../static_site/images/**/*',
  ], { force: true });
});

// give unique names to posts in jekyll
// copies files into temporary location
gulp.task('unique-names', ['clean-jekyll'], function(cb) {
  return gulp.src("../docs/*.md")
    .pipe(rename(function (path) {
      var d = moment().format("YYYY-MM-DD");
      path.basename = d + "-" + path.basename;
    }))
    .pipe(gulp.dest("../static_site/tmp")); 
});

// generate links to images in jekyll format
gulp.task('generate-images-links', ['unique-names'], function(){
  return gulp.src(['../static_site/tmp/**/*.md'])
    .pipe(replace(/.\//g, '{{ site.url }}/images/{{ page.path | remove_first: "_posts/" | split: "/" | first }}/'))
    .pipe(gulp.dest('../static_site/_posts'));
});

// copy images to jekyll into images folder
gulp.task('copy-images-jekyll', ['clean-jekyll'], function() {
   return gulp.src('../docs/docs/**/*.jpg')
   .pipe(gulp.dest('../static_site/images'));
});

// construct the raw files for jekyll
gulp.task('jekyll', ['clean-jekyll', 'unique-names', 'copy-images-jekyll', 'generate-images-links']);

// build the jekyll site nd serve it
gulp.task('build', shell.task([
  '(cd ../static_site; jekyll build)'
]));

gulp.task('serve', shell.task([
  '(cd ../static_site; jekyll serve)'
]));
