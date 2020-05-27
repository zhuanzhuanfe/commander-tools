'use strict'

const fs = require('fs')
const path = require('path')
const existSync = fs.existsSync

function getPrettierConfig() {
  const customizePrettierDir = path.join(process.cwd(), 'prettier.config.js')
  const prettierConfig = {}

  if (existSync(customizePrettierDir)) {
    prettierConfig.configFile = customizePrettierDir
  } else {
    prettierConfig.configFile = path.join(__dirname, '../config/prettier.config.js')
  }

  return prettierConfig
}

module.exports = getPrettierConfig()
