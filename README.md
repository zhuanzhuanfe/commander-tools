# @zz-biz/tools@0.0.4

## 功能

```bash
# 本地测试模式，外链形式
$ zz-tools run dev
# 编译es5，es6代码，例如lib，es文件夹
$ zz-tools run compile
# 编译代码，外链形式
$ zz-tools run dist
# 打包编译，集成compile 和 dist
$ zz-tools run build
# 发布npm包，同时gitlab标签
$ zz-tools run pub
# 发布npm的beta包，同时gitlab标签
$ zz-tools run pub-beta
# 删除gitlab及npm包对应版本代码
$ zz-tools run unpub
# 打开开发文档在浏览器中运行
$ zz-tools run doc
# 编译开发文档
$ zz-tools run build-doc
# 上传文档到ftp
$ zz-tools run doc-upload
```