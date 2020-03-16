'use strict';
const fs = require('fs');
const path = require('path');
const existSync = fs.existsSync;

module.exports = function () {
  // const pkg = require(path.join(process.cwd(), 'package.json'));
  const customizeBabelDir = path.join(process.cwd(), 'babel.config.js');
  const babelConfig = {};

  if (existSync(customizeBabelDir)) {
    babelConfig.configFile = customizeBabelDir;
  } else {
    babelConfig.configFile = path.join(__dirname, './babel.config.js');
  }

  // babelConfig.plugins.push([
  //   require.resolve('babel-plugin-import'),
  //   {
  //     style: true,
  //     libraryName: pkg.name,
  //     libraryDirectory: 'src',
  //   },
  // ]);

  return babelConfig
};
