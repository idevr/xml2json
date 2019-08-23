const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');
const typescript = require('gulp-typescript');

const cleanES = function () {
  return clean([
    './tmp/src.es/**/*',
  ]);
}
cleanES.displayName = 'Clean ES files';

const tsProject = typescript.createProject({
  allowSyntheticDefaultImports: true,
  declaration: false,
  esModuleInterop: true,
  module: 'es2015',
  moduleResolution: 'node',
  target: 'ES2015'
});

const generateES = function () {
  return src([
    './src/**/*.ts',
  ])
    .pipe(tsProject())
    .pipe(dest('tmp/src.es'));
};
generateES.displayName = 'Generate ES files from TS files';

module.exports = {
  cleanES,
  generateES,
};
