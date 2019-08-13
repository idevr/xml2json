const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');

// JSDoc

const jsdoc = require('gulp-jsdoc3');
const jsdocConfig = require('./jsdoc.config.js');

function cleanDocs() {
  console.log('Cleaning docs directory.');
  return clean([
    './docs/**/*',
  ]);
}

function generateDocs() {
  console.log('Generating documentation.');
  return src([
    './tmp/src.es/**/*.js'
  ], { read: false })
    .pipe(jsdoc(jsdocConfig));
}

// TypeScript

const typescript = require('gulp-typescript');

function cleanES() {
  console.log('Cleaning ECMAScript compatible files located in "tmp/src.es" directory.');
  return clean([
    './tmp/src.es/**/*',
  ]);
}

const tsProject = typescript.createProject({
  allowSyntheticDefaultImports: true,
  declaration: false,
  esModuleInterop: true,
  module: 'es2015',
  moduleResolution: 'node',
  target: 'ES2015'
});

function generateES() {
  console.log('Generating ECMAScript compatible files in "tmp/src.es".');
  return src([
    './src/**/*.ts',
  ])
    .pipe(tsProject())
    .pipe(dest('tmp/src.es'));
};

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
    series(cleanCompiledFiles, compileSourceFiles),
    series(cleanES, generateES, cleanDocs, generateDocs)
  ));
}

module.exports = {
  build: parallel(
    series(cleanDist, compileSourceFiles),
    series(cleanES, generateES, cleanDocs, generateDocs)
  ),
  'build:js': series(cleanCompiledFiles, compileSourceFiles),
  'build:es': series(cleanES, generateES),
  'build:docs': series(cleanES, generateES, cleanDocs, generateDocs),
  'build:w': watchSourceFiles,
};
