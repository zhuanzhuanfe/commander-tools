'use strict';
const fs = require('fs');
const path = require('path');
const existSync = fs.existsSync;

module.exports = function (modules) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const customizeBabelFile = path.join(process.cwd(), '.babelrc.js');
  let babelConfig;

  if (existSync(customizeBabelFile)) {
    const babelrc = require(customizeBabelFile);
    babelConfig = babelrc(modules);
  } else {
    const babelrc = require('./.babelrc.js');
    babelConfig = babelrc(modules);
  }

  babelConfig.plugins.push([
    require.resolve('babel-plugin-import'),
    {
      style: true,
      libraryName: pkg.name,
      libraryDirectory: 'src',
    },
  ]);
};
