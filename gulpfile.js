const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');

// Babel

const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

function cleanCompiledFiles() {
  console.log('Cleaning compiled files located in the distribution directory.');
  return clean([
    './dist/**/*.js'
  ]);
}

function compileSourceFiles() {
  console.log('Compiling source files to the distribution directory.');
  return src([
    './src/**/*.ts',
    '!./src/**/*.types.d.ts',
  ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(dest('./dist'));
}

// Common

function cleanDist() {
  console.log('Cleaning distribution directory.');
  return clean([
    './dist/**/*',
  ]);
}

function watchSourceFiles() {
  watch([
    './src/**/*.ts',
    '!./src/**/*.types.d.ts',
  ], parallel(
    series(cleanCompiledFiles, compileSourceFiles)
  ));
}

module.exports = {
  build: series(
    cleanDist,
    compileSourceFiles
  ),
  'build:js': series(cleanCompiledFiles, compileSourceFiles),
  'build:w': parallel(watchSourceFiles),
};
