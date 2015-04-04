var gulp = require('gulp'),
less = require('gulp-less'),
path = require('path'),
autoprefixer = require('gulp-autoprefixer'),
minifycss = require('gulp-minify-css'),
rename = require('gulp-rename'),
concat = require('gulp-concat'),
notify = require('gulp-notify'),
uglify = require('gulp-uglify'),
bowerSrc = require('gulp-bower-src'),
livereload = require('gulp-livereload'),
sourcemaps = require('gulp-sourcemaps'),
plumber = require('gulp-plumber'),
replace = require('gulp-replace'),
lr = require('tiny-lr'),
gulpFilter = require('gulp-filter'),
minifyHtml    = require('gulp-minify-html'),
templateCache = require('gulp-angular-templatecache'),
server = lr();

var getStamp = function() {
  var myDate = new Date();

  var myYear = myDate.getFullYear().toString();
  var myMonth = ('0' + (myDate.getMonth() + 1)).slice(-2);
  var myDay = ('0' + myDate.getDate()).slice(-2);
  var mySeconds = myDate.getSeconds().toString();

  var myFullDate = myYear + myMonth + myDay;

  return myFullDate;
};

gulp.task('cache_templates', function() {
   var filename = 'templates-' + getStamp() + '.js';
  gulp.src('assets/templates/**/*.html')
    .pipe(minifyHtml({empty: true}))
    .pipe(templateCache({
      standalone: true,
      root: '/assets/templates'
    }))
    .pipe(concat(filename))
    .pipe(gulp.dest('public/assets/js'))
    .pipe(notify({ message: 'template task completed.' }));

    gulp.src('app/views/master.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<script id=\"templates\".*><\/script>/g, '<script id="templates" src="/assets/js/' + filename + '"></script>'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.

    gulp.src('app/views/master_auth.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<script id=\"templates\".*><\/script>/g, '<script id="templates" src="/assets/js/' + filename + '"></script>'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.


});

gulp.task('styles', function() {
  var filename = 'styles-' + getStamp() + '.css';
	gulp.src('assets/css/styles.less')
	.pipe(less())
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
	.pipe(minifycss())
  .pipe(concat(filename))
	.pipe(gulp.dest('public/assets/css'))
	.pipe(notify({ message: 'Style task completed.' }));

  gulp.src('app/views/master.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<link rel=\"stylesheet\" id=\"bundlecss\".*>/g, '<link rel="stylesheet" id="bundlecss" href="/assets/css/' + filename + '">'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.

  gulp.src('app/views/master_auth.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<link rel=\"stylesheet\" id=\"bundlecss\".*>/g, '<link rel="stylesheet" id="bundlecss" href="/assets/css/' + filename + '">'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.

  // gulp.src([
  //   'assets/bower_components/angular-snap/angular-snap.min.css',
  //   ])
  // .pipe(minifycss())
  // .pipe(plumber())
  // .pipe(concat('vendor.css'))
  // .pipe(gulp.dest('public/assets/css'));
});

gulp.task('scripts', function() {

	gulp.src([
        'assets/bower_components/jquery/dist/jquery.min.js',
        'assets/bower_components/lodash/dist/lodash.min.js',
        'assets/bower_components/typeahead.js/dist/typeahead.bundle.min.js',
        'assets/bower_components/angular/angular.min.js',
		    'assets/bower_components/angular-bootstrap/ui-bootstrap.min.js',
        'assets/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'assets/bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'assets/bower_components/angular-resource/angular-resource.min.js',
        'assets/bower_components/angular-animate/angular-animate.min.js',
        'assets/bower_components/angular-touch/angular-touch.min.js', 
        'assets/bower_components/venturocket-angular-slider/build/angular-slider.js',
        'assets/bower_components/angular-typeahead/angular-typeahead.min.js',
        'assets/bower_components/moment/min/moment.min.js',
        'assets/bower_components/angular-utils-pagination/dirPagination.js',
        'assets/bower_components/angular-slugify/angular-slugify.js',
        'assets/vendor/hammer.min.js',
        'assets/vendor/getstream.js',
        'assets/bower_components/ryanmullins-angular-hammer/angular.hammer.js',
        'assets/bower_components/angulartics/dist/angulartics.min.js',
        'assets/bower_components/angulartics/dist/angulartics-ga.min.js',
        'assets/bower_components/angular-elastic/elastic.js',
        ])  
        .pipe(plumber())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(notify({ message: 'Scripts task completed.' }));

    var filename = 'app-' + getStamp() + '.js';
    gulp.src('assets/app_ui/js/**/*.js')
        .pipe(plumber())
        .pipe(concat(filename))
        .pipe(gulp.dest('public/assets/js'));

    gulp.src('app/views/master.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<script id=\"bundle\".*><\/script>/g, '<script id="bundle" src="/assets/js/' + filename + '"></script>'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.

    gulp.src('app/views/master_auth.blade.php', { base: './' }) //must define base so I can overwrite the src file below. Per http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files
        .pipe(replace(/<script id=\"bundle\".*><\/script>/g, '<script id="bundle" src="/assets/js/' + filename + '"></script>'))  //so find the script tag with an id of bundle, and replace its src.
        .pipe(gulp.dest('./')); //Write the file back to the same spot.

});



gulp.task('watch', function() {
	server.listen(35729, function (e) {
		if (e) {
			return console.log(e)
		};
 
		gulp.watch(['assets/css/*.less'], ['styles']);
		gulp.watch(['assets/**/*.js'], ['scripts']);
    gulp.watch('assets/templates/**/*.html', ['cache_templates']);
		
	});
});