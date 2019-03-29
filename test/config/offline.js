// 文档地址：http://gitlab.zhuanspirit.com/zz-fe-base/webpack-offline/blob/master/README.md
const config = require('./index')

module.exports = {
  name: 'test',
  startUp: false, // 开关。默认：关闭
  assetsPublicPath: config.build.assetsPublicPath,
  map: [
    {
      src: 'static/js',
      dest: 'js',
      include: [] // 指定需要打包的js文件名，默认打包全部
    },
    {
      src: 'static/css',
      dest: 'css',
      include: [] // 指定需要打包的css文件，默认打包全部
    },
    {
      src: 'static/img',
      dest: 'img',
      include: [] // 指定需要打包的图片，默认不打包。
    },
    {
      isWebserver: true,
      dest: 'html',
      include: []
    }
  ]
}
