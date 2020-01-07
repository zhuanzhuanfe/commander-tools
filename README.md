# @zz-common/commander-tools

## 功能

```bash
# 本地测试模式，外链形式
$ commander-tools run dev
# 编译es5，es6代码，例如lib，es文件夹
$ commander-tools run compile
# 编译代码，外链形式
$ commander-tools run dist
# 打包编译，集成compile 和 dist
$ commander-tools run build
# 发布npm包，同时gitlab标签
$ commander-tools run pub
# 发布npm的beta包，同时gitlab标签
$ commander-tools run pub-beta
# 删除gitlab及npm包对应版本代码
$ commander-tools run unpub
# 打开开发文档在浏览器中运行（此命令任何项目都适用）
$ commander-tools run doc
# 编译开发文档（此命令任何项目都适用）
$ commander-tools run build-doc
# 上传文档到ftp（此命令任何项目都适用）
$ commander-tools run doc-upload
```

## 使用示例

```javascript
// package.json
"scripts": {
  "doc": "commander-tools run doc",
  "build-doc": "commander-tools run build-doc",
  "upload-doc": "commander-tools run doc-upload"
}
```
