# test

> 地址：http://m.zhuanzhuan.com/biz/test/index.html

> 转转前端vue项目

## 使用

``` bash
# 安装依赖（如果生成初始化项目时已经安装完毕，无需安装）
npm install

# 开发模式 localhost:8080
npm run dev

# 构建模式
npm run build

# 构建模式 + 分析报告
npm run build --report

# mock数据模式

```

项目模版来自 [zz-webpack-react-tpl](http://gitlab.zhuanspirit.com/zz-fe/zz-webpack-react-tpl)，如果有任何问题，可以在issues中提供建议 [issues](http://gitlab.zhuanspirit.com/zz-fe/zz-webpack-react-tpl/issues)

## api文档

### @zz-yp/native-adapter

转转Native和Web的交互SDK, 抹平各端差异sdk

地址：[https://cnpm.zhuanspirit.com/package/@zz-yp/native-adapter](https://cnpm.zhuanspirit.com/package/@zz-yp/native-adapter)

负责人：王金录

### @zz/zz-jssdk

转转Native和Web的交互SDk, 已在@zz-yp/native-adapter兼容，推荐使用adapter

地址：[https://cnpm.zhuanspirit.com/package/@zz/zz-jssdk](https://cnpm.zhuanspirit.com/package/@zz/zz-jssdk)

负责人：赵慧杰

### @zz-yy/badjs-webpack-plugin

js异常上报，脚手架中已集成，打开需要申请id，申请地址：[http://betterjs.zhuanspirit.com](http://betterjs.zhuanspirit.com)

修改配置文件：`config/index.js`

```javascript
...
build:{
  web: 'webserver', // 存放html文件的目录
  badjs: 0, // 申请的异常上报 id，配置模版填入id，默认 0，不上报
}
```

地址：[https://cnpm.zhuanspirit.com/package/@zz-yy/badjs-webpack-plugin](https://cnpm.zhuanspirit.com/package/@zz-yy/badjs-webpack-plugin)

负责人：王金录

### @zz/lego

转转lego埋点上报，包括t值初始化，lego上报埋点，曝光埋点等

地址：[http://gitlab.zhuanspirit.com/zz-fe/zz-lego](http://gitlab.zhuanspirit.com/zz-fe/zz-lego)

负责人：袁小龙


### @zz/webpack-vue

转转脚手架vue打包工具

地址：[http://gitlab.zhuanspirit.com/zz-fe/webpack-vue](http://gitlab.zhuanspirit.com/zz-fe/webpack-vue)

负责人：袁小龙

## 部署

### 测试环境

jenkins: [http://build.zhuanspirit.com/jenkins/job/fe-test-test/](http://build.zhuanspirit.com/jenkins/job/fe-test-test/)

#### .2服务器

```javascript
// host
192.168.187.2 img1.zhuanstatic.com
192.168.187.2 s1.zhuanstatic.com
192.168.187.2 m.zhuanzhuan.com

//jenkins
m.zhuanzhuan.com-2-for-test
img.zhuanstatic.com-2-for-test
s.zhuanstatic.com-2-for-test
```

#### .3服务器

```javascript
// host
192.168.187.3 img1.zhuanstatic.com
192.168.187.3 s1.zhuanstatic.com
192.168.187.3 m.zhuanzhuan.com

//jenkins
m.zhuanzhuan.com-3-for-test
img.zhuanstatic.com-3-for-test
s.zhuanstatic.com-3-for-test
```

### 线上环境

jenkins: [http://build.zhuanspirit.com/jenkins/view/fe/view/online/view/fe-test-release/](http://build.zhuanspirit.com/jenkins/view/fe/view/online/view/fe-test-release/)