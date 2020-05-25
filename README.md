# @zz-common/commander-tools

## 功能

```bash
# eslint 校验
$ commander-tools run lint
# eslint 校验并修复
$ commander-tools run lint --fix
# eslint 校验暂存区的文件
$ commander-tools run lint --staged

# 本地开发模式
$ commander-tools run dev

# 编译 es5，es6 代码，到 lib，es 文件夹
$ commander-tools run compile

# 编译代码，外链形式
$ commander-tools run dist
# 编译代码，单文件形式
$ commander-tools run dist --single
# 编译代码，分析模式
$ commander-tools run dist --analyz

# 打包编译，集成 compile, dist 和 build-doc
$ commander-tools run build

# 发布 npm 包，同时更新 gitlab 标签
$ commander-tools run pub

# 发布 npm 的 beta 包，同时更新 gitlab 标签
$ commander-tools run pub-beta

# 删除 gitlab 及 npm 包对应版本代码
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
