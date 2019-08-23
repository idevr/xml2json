const {
  src, dest, series, parallel, watch,
} = require('gulp');
const clean = require('del');
const babel = require('./babel');
const typescript = require('./typescript');
const jsdoc = require('./jsdoc');

const cleanDist = function () {
  return clean([
    './dist/**/*',
  ]);
}
cleanDist.displayName = 'Clean distribution directory';

const buildJS = series(
  babel.cleanCompiledFiles,
  babel.compileSourceFiles,
);

const buildES = series(
  typescript.cleanES,
  typescript.generateES,
);

const buildDocs = series(
  jsdoc.cleanDocs,
  jsdoc.generateDocs,
);

const buildWatch = function () {
  watch([
    './src/**/*.ts',
    '!./src/**/*.types.d.ts',
  ], parallel(
    buildJS,
    series(
      buildES,
      buildDocs,
    ),
  ));
}

module.exports = {
  build: parallel(
    series(
      cleanDist,
      babel.compileSourceFiles,
    ),
    series(
      buildES,
      buildDocs,
    ),
  ),
  'build:js': buildJS,
  'build:es': buildES,
  'build:docs': series(
    buildES,
    buildDocs,
  ),
  'build:w': buildWatch,
};
