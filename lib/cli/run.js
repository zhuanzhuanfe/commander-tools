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
  // eslint
  .option('--staged', '只校验暂存区的文件')
  .option('--fix', '校验并修复')
  // jest
  .option('--coverage', '展示单元测试覆盖率')

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
