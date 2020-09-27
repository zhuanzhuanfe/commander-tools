#!/usr/bin/env node
'use strict'

require('colorful').colorful()
const gulp = require('gulp')
const program = require('commander')
program
  // 上传文档
  .option('-d, --docsDirName <name>', '上传doc目录')
  .option('-g, --groupName <name>', '上传doc组名')
  // 打包构建
  .option('-s, --single', '单位件构建模式')
  .option('-a, --analyz', '分析模式')
  .option('-k, --keep', '保留旧的 static')
  .option('-c, --keepconsole', '保留console')
  // eslint
  .option('--fix', '校验并修复')
  .option('--staged', '只校验暂存区的文件')

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color)
  console.log()
})

program.parse(process.argv)

const task = program.args[0]
if (!task) {
  program.help()
} else {
  require('../gulpfile')(program)
  gulp.series(task)()
}
