var gulp = require('gulp'),
sass = require('gulp-ruby-sass'),
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
	return gulp.src('assets/sass/styles.scss')
    .pipe(plumber())
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
	.pipe(rename({ suffix: '.min' }))
	//.pipe(minifycss())
	.pipe(gulp.dest('public/assets/css'))
	.pipe(notify({ message: 'Style task completed.' }));
});

gulp.task('scripts', function() {
	gulp.src([
        'assets/bower_components/jquery/dist/jquery.min.js',
        'assets/bower_components/lodash/dist/lodash.min.js',
		'assets/bower_components/foundation/js/foundation.min.js',
		'assets/bower_components/fastclick/lib/fastclick.js',
        'assets/bower_components/angular/angular.min.js',
        'assets/bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'assets/bower_components/angular-resource/angular-resource.min.js',
        'assets/bower_components/angular-animate/angular-animate.min.js',
        'assets/bower_components/angular-touch/angular-touch.min.js',
        'assets/bower_components/venturocket-angular-slider/build/angular-slider.js'])
        .pipe(plumber())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/assets/js'));

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

		gulp.watch(['assets/sass/*.scss'], ['styles']);
		gulp.watch(['assets/**/*.js'], ['scripts']);
		
	});
});