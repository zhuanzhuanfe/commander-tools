// 引入 webpack 打包工具
const webpackVue = require('@zz/webpack-vue')
// webpack公共配置
const config = require('../config/index.js')
module.exports = webpackVue(config).then(res => {
  return res
}).catch(err => {
  console.log(err);
})