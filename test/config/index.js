let path = require('path')
const resolve = (pathname = '') => {
  return path.join(__dirname,'../', pathname)
};
module.exports = {
    // 基础配置
    base:{
      // 入口文件配置
      entry:{
        vendor: [resolve('src/lib/polyfill.js'), 'vue', 'vue-router'],
        app: [resolve('src/lib/polyfill.js'), resolve('src/main.js')]
      },
      externals: {}, // 排除部分第三方组件不打包
      cssExtract: false,
      commonCss: [resolve('src/assets/css/base.scss')], // 公共sass, less文件
      alias:{}, // 设置别名
      babelInclude: [], //第三方库使用babel功能
      merge:{} // 自定义webpack配置
    },
    // 开发模式配置
    dev:{
      https: false, // https功能，默认关闭
      host: 'localhost', // 本地启动地址
      port: 8080, // 启动端口号
      assetsPublicPath: '/biz/test/', // 访问虚拟路径，例如 http://localhost/Mzhuanzhuan/test/index.html
      proxyTable: {}, // 代理
      commonDefine: { // 定义公共变量，与proxy配合使用可实现跨域及mock数据
        API_BASE_URL: ''
      },
      autoOpenBrowser: true, // 启动时自动打开浏览器，默认开启，true/false
      useEslint:true, // 开启eslint验证，配置模版时选择开启或关闭，true/false
      vconsole: false, // 开启调试模式，默认关闭，true/false
      merge:{} // 自定义webpack配置
    },
    build:{
      web: 'webserver', // 存放html文件的目录
      badjs: 0, // 申请的异常上报 id，配置模版填入id，默认 0，不上报
      assetsPublicPath: 'https://s1.zhuanstatic.com/biz/test/', // js，css，font地址
      imgPublicPath: 'https://img1.zhuanstatic.com/biz/test/',  // 图片及多媒体地址
      bundleAnalyzerReport: false, // 开启代码分析报告功能，默认关闭，true/false，也可使用命令 npm run build --report
      productionSourceMap: true,   // 开启生成sourcemap功能，true/false
      assetsRoot: path.resolve(__dirname, '../dist'), // 打包生成的文件存放目录
      payHtml: [], // 如果某个页面需要放在wx域名的根目录下，则使用，例如: ['pay.html']
      commonDefine: { // 定义公共变量，与proxy配合使用可实现跨域及mock数据
        API_BASE_URL: ''
      },
      merge:{} // 自定义webpack配置
    }
}
