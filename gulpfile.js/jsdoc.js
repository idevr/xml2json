const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');
const jsdoc = require('gulp-jsdoc3');
const jsdocConfig = require('../jsdoc.config.js');

const cleanDocs = function () {
  return clean([
    './docs/**/*',
  ]);
}
cleanDocs.displayName = 'Clean documentation';

const generateDocs = function () {
  return src([
    './tmp/src.es/**/*.js'
  ], { read: false })
    .pipe(jsdoc(jsdocConfig));
}
generateDocs.displayName = 'Generate documentation';

module.exports = {
  cleanDocs,
  generateDocs,
};
