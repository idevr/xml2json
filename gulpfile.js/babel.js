const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const cleanCompiledFiles = function () {
  return clean([
    './dist/**/*.js'
  ]);
}
cleanCompiledFiles.displayName = 'Clean compiled files';

const compileSourceFiles = function () {
  return src([
    './src/**/*.ts',
    '!./src/**/*.types.d.ts',
  ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(dest('./dist'));
}
compileSourceFiles.displayName = 'Compile source files';

module.exports = {
  cleanCompiledFiles,
  compileSourceFiles,
};
