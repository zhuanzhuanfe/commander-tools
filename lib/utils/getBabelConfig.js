'use strict'

const fs = require('fs')
const path = require('path')
const existSync = fs.existsSync

function getBabelConfig() {
  const customizeBabelDir = path.join(process.cwd(), 'babel.config.js')
  const babelConfig = {}

  if (existSync(customizeBabelDir)) {
    babelConfig.configFile = customizeBabelDir
  } else {
    babelConfig.configFile = path.join(__dirname, '../config/babel.config.js')
  }

  return babelConfig
}

module.exports = getBabelConfig()
