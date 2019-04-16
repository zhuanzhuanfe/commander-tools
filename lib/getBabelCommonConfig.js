'use strict';
const fs = require('fs');
const path = require('path');
const existSync = fs.existsSync;

module.exports = function (modules) {
  const babelFile = path.join(process.cwd(), '.babelrc.js');
  if (existSync(babelFile)) {
    const babelrc = require(babelFile);
    return babelrc(modules);
  } else {
    const babelrc = require('./.babelrc.js');
    return babelrc(modules);
  }
};