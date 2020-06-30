# @zz-common/commander-tools

`commander-tools` 是转转 FE 团队的基础库开发工具，集成了基础库开发过程中常用的本地调试、编译、打包、生成文档、发版等功能。

配合 `sdk` 模板使用可以大幅提高开发效率，只需专注业务逻辑，无需关心项目工程化的实现。

## 使用

### 安装

```bash
$ npm i -D @zz-common/commander-tools
```

### 配置

在 `package.json` 的 `scripts` 配置中添加如下指令，即可使用

```json
{
  "scripts": {
    "lint": "commander-tools run lint",
    "fix": "commander-tools run lint --fix",
    "staged": "commander-tools run lint --staged",
    "dev": "commander-tools run dev",
    "compile": "commander-tools run compile",
    "dist": "commander-tools run dist",
    "analyz": "commander-tools run dist --analyz",
    "build": "commander-tools run build",
    "pub": "commander-tools run pub",
    "pub-beta": "commander-tools run pub-beta",
    "unpub": "commander-tools run unpub",
    "doc": "commander-tools run doc",
    "build-doc": "commander-tools run build-doc",
    "doc-upload": "commander-tools run doc-upload"
  }
}
```

## API

### eslint 校验

```bash
# eslint 校验
$ commander-tools run lint
# eslint 校验并修复
$ commander-tools run lint --fix
# eslint 校验暂存区的文件
$ commander-tools run lint --staged
```

### 本地调试

```bash
# 本地调试模式
$ commander-tools run dev
```

### 代码构建

```bash
# 编译成 esModule 和 commonjs 模块，到 es, lib 文件夹
$ commander-tools run compile

# 编译代码，外链形式（默认 src 顶层目录下的文件都会作为入口文件）
$ commander-tools run dist
# 编译代码，单入口形式
$ commander-tools run dist --single
# 编译代码，分析 bundle 大小
$ commander-tools run dist --analyz

# 打包编译，集成 compile, dist 和 build-doc
$ commander-tools run build
```

### 生成文档

```bash
# 打开开发文档在浏览器中运行
$ commander-tools run doc

# 生成文档
$ commander-tools run build-doc

# 上传文档
$ commander-tools run doc-upload
```

### npm 发版

```bash
# 发布 npm 正式包，同时更新 tag
$ commander-tools run pub

# 发布 npm beta 包
$ commander-tools run pub-beta

# 删除 npm 包对应版本和 tag
$ commander-tools run unpub
```

## 附加能力

### commitizen

`commander-tools` 也集成了友好的问答式 `git commit` 指令，帮助提高基础库开发的 `commit` 规范，只需在 `package.json` 中添加如下配置：

```json
{
  "scripts": {
    "cz": "git cz -a"
  },
  "config": {
    "commitizen": {
      "path": "@zz-common/commander-tools/lib/config/commitizen.config"
    }
  },
}
```

即可通过 `npm run cz` 指令代替 `git add . && git commit -m 'xxx'`，效果如下：

![cz](https://pic5.zhuanstatic.com/zhuanzh/n_v2dded52be953c44268e0e4c8f72937363.jpg)

### commitlint

配合 `husky` 使用，则能更好的在每次提交代码前校验本次修改的代码和 `commit` 信息，确保代码稳定和 `commit` 规范。

`commander-tools` 也内置了相关功能。

1. 安装 `husky`

```bash
$ npm i -D husky
```

2. 在 `package.json` 中添加如下配置：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "commander-tools run lint --staged",
      "commit-msg": "commander-tools run commitlint"
    }
  }
}
```
