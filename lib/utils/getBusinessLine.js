const fs = require('fs')
const path = require('path')

exports.getBusinessLine = function getBusinessLine(program) {
  const docConfigDir = path.join(process.cwd(), 'doc.config.json')
  let businessLine

  if (program && program.groupName) {
    businessLine = program.groupName
  } else if (fs.existsSync(docConfigDir)) {
    businessLine = require(docConfigDir).businessLine
  } else {
    businessLine = 'common'
  }

  return businessLine
}
