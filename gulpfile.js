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
lr = require('tiny-lr'),
gulpFilter = require('gulp-filter'),
server = lr();


gulp.task('styles', function() {
	gulp.src('assets/css/styles.less')
	.pipe(less())
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
	.pipe(rename({ suffix: '.min' }))
	//.pipe(minifycss())
	.pipe(gulp.dest('public/assets/css'))
	.pipe(notify({ message: 'Style task completed.' }));

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
        'assets/bower_components/moment/moment.js',
        'assets/bower_components/angular-utils-pagination/dirPagination.js',
        'assets/bower_components/angular-slugify/angular-slugify.js',
        ])  
        .pipe(plumber())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(notify({ message: 'Scripts task completed.' }));

    gulp.src('assets/app_ui/js/**/*.js')
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/assets/js'));
});


gulp.task('watch', function() {
	server.listen(35729, function (e) {
		if (e) {
			return console.log(e)
		};
 
		gulp.watch(['assets/css/*.less'], ['styles']);
		gulp.watch(['assets/**/*.js'], ['scripts']);
		
	});
});