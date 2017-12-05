// Load plugins
var gulp       = require('gulp'),
	source     = 'src',

	changed      = require('gulp-changed'),
	coffee       = require('gulp-coffee'),
	debug        = require('gulp-debug'),
	gulpPug      = require('gulp-pug'),
	gutil        = require('gulp-util'),
	htmlbeautify = require('gulp-html-beautify'),
	inject       = require('gulp-inject'),
	notify       = require('gulp-notify'),
	run          = require('gulp-run'),
	runSequence  = require('run-sequence'),
	sourcemaps   = require('gulp-sourcemaps'),
	stylus       = require('gulp-stylus');

// Error notificator
var reportError = function (error) {
	var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

	notify({
		title: 'Task Failed [' + error.plugin + ']',
		message: lineNumber + 'See console.',
		sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	}).write(error);

	gutil.beep(); // Beep 'sosumi' again

	// Inspect the error object
	//console.log(error);

	// Easy error reporting
	//console.log(error.toString());

	// Pretty error reporting
	var report = '';
	var chalk = gutil.colors.white.bgRed;

	report += chalk('TASK:') + ' [' + error.plugin + ']\n';
	report += chalk('PROB:') + ' ' + error.message + '\n';
	if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
	if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
	console.error(report);

	// Prevent the 'watch' task from stopping
	this.emit('end');
};

// Clean
gulp.task('clean', function(cb) {
	return run( 'rimraf *.html css js/*.js').exec();
});

gulp.task('coffee', function () {
	return gulp.src(source + '/coffee/**/*.coffee')
		.pipe(coffee({bare: true}))
		.on('error', reportError )
		.pipe(gulp.dest('js/'))
		.pipe(debug());
});

// Styles
gulp.task('styles', function () {
	return gulp.src([source + '/styl/**/*.styl', '!' + source + '/styl/**/_*.styl'])
		.pipe(sourcemaps.init())
		.on('error', reportError )
		.pipe( stylus() )
		.on('error', reportError )
		.pipe(sourcemaps.write('.'))
		.on('error', reportError )
		.pipe(gulp.dest('css/'))
		.pipe(debug());
});

// Layout
gulp.task('layout', function buildHTML() {
	var css = gulp.src('css/*.css', {read: false}),
		libs = gulp.src(['js/vendor/*.js', '!js/vendor/jquery*.*'], {read: false});

	return gulp.src([source + '/**/*.pug', '!' + source + '/**/_*.pug'])
		.pipe(gulpPug({ }))
		.on('error', reportError )
		.pipe(inject(libs, {ignorePath: 'src', starttag: '<!-- inject:libs:{{ext}} -->', addRootSlash: false}))
		.on('error', reportError )
		.pipe(inject(css, {ignorePath: 'src', addRootSlash: false}))
		.on('error', reportError )
		.pipe(htmlbeautify(
			options = {
				indent_size: 1,
				indent_char: "\t"
			}))
		.on('error', reportError )
		.pipe(gulp.dest(''))
		.pipe(debug());
});

gulp.task('default', ['clean'], function(cb) {
  runSequence(['styles', 'coffee'], 'layout', cb);
});
