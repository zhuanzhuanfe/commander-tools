const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')

function getJsdocConfig() {
  const configOri = require(path.join(__dirname, '../../jsdoc.json'))
  const jsdocConfDir = path.join(process.cwd(), 'jsdoc.conf.json')
  const jsdocDir = path.join(process.cwd(), 'jsdoc.json')
  let jsdocConfig = {}

  if (fs.existsSync(jsdocConfDir)) {
    jsdocConfig = merge(configOri, require(jsdocConfDir))
  } else if (fs.existsSync(jsdocDir)) {
    jsdocConfig = merge(configOri, require(jsdocDir))
  } else {
    jsdocConfig = configOri
  }

  return jsdocConfig
}

module.exports = getJsdocConfig
