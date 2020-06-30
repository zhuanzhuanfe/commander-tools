const fs = require('fs')
const path = require('path')

function getBusinessLine(program) {
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

module.exports = getBusinessLine
