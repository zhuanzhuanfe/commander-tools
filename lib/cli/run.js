#!/usr/bin/env node
'use strict';

require('colorful').colorful();
const gulp = require('gulp');
const program = require('commander');
program
  .option('-d, --docsDirName <name>', '上传doc目录')
  .option('-g, --groupName <name>', '上传doc组名')
  .option('-s, --single', '单位件构建模式')
  .option('-a, --analyz', '分析模式')

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
});

program.parse(process.argv);

const task = program.args[0];
if (!task) {
  program.help();
} else {
  require('../gulpfile')(program);
  gulp.series(task)();
}
