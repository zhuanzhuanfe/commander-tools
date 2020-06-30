'use strict'

const fs = require('fs')
const path = require('path')
const existSync = fs.existsSync

function getEslintConfig() {
  const customizeEslintDir = path.join(process.cwd(), '.eslintrc.js')
  let eslintConfig

  if (existSync(customizeEslintDir)) {
    eslintConfig = customizeEslintDir
  } else {
    eslintConfig = path.join(__dirname, '../config/.eslintrc.js')
  }

  return eslintConfig
}

module.exports = getEslintConfig()
