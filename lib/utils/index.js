const fs = require('fs')
const path = require('path')
const open = require('open')
const { execSync } = require('child_process')
const through2 = require('through2')
const jsdoc = require('gulp-jsdoc3')
const babel = require('gulp-babel')
const gulp = require('gulp')
const merge2 = require('merge2')
const rimraf = require('rimraf')
const stripCode = require('gulp-strip-code')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const WebpackDevServer = require('webpack-dev-server')
const gitBranch = require('current-git-branch')
const chalk = require('chalk')

const runCmd = require('../runCmd')
const isCanPub = require('./isCanPub')
const babelConfig = require('./getBabelConfig')
const getJsdocConfig = require('./getJsdocConfig')
const getBusinessLine = require('./getBusinessLine')
const getWebPackProdConfig = require('../config/webpack.prod.config.js')
const packageJson = require(`${process.cwd()}/package.json`)

const cwd = process.cwd()
const existsSync = fs.existsSync
const libDir = path.join(cwd, 'lib')
const esDir = path.join(cwd, 'es')
const publishNpm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function __checkRegistry() {
  let checkRegistryPass = false;
  ['npm'].map(item => {
    const registry = execSync(`${item} config get registry`).toString()
    if (
      [
        'https://rcnpm.zhuanspirit.com/',
        'http://rcnpm.zhuaninc.com/'
      ].includes(registry.replace(/\s/g, ''))
    )
      checkRegistryPass = true
  })
  if (!checkRegistryPass)
    throw '请设置：npm config set registry https://rcnpm.zhuanspirit.com'
}

function __hasTag() {
  const { version } = packageJson
  const tagList = execSync('git tag -l')
  const regExp = new RegExp(`${version}[\n\t\r]`, 'g')
  const hasTag = regExp.test(tagList.toString())

  return hasTag
}

function __tag(status) {
  return new Promise((resolve) => {
    const curBranch = gitBranch()
    const { version } = packageJson

    if (status === 'pub') { // 只在正式包添加 tag
      try {
        if (__hasTag()) {
          console.log()
          console.log(
            chalk.red(
              `fail: 发布失败，gitlab仓库已存在当前版本分支(${curBranch}/${version})标签，请修改当前包的版本`
            )
          )
          resolve(false)
        } else {
          execSync(`git tag ${version}`)
          execSync(`git push origin ${version}:${version}`)
          execSync(`git push origin ${curBranch}:${curBranch}`)
          console.log()
          console.log(
            chalk.green(
              `success: 代码推送成功，生成标签(${curBranch}/${version})`
            )
          )
          resolve(true)
        }
      } catch (err) {
        console.log()
        console.log(err)
        console.log(chalk.red('fail: tagged'))
        resolve(false)
      }
    } else {
      resolve(true)
    }
  })
}

function __publish(status, program, done) {
  __checkRegistry()

  dist(program, code => {
    if (code) {
      done(code)
      return
    }

    __tag(status).then(result => {
      if (result) {
        let args = ['publish']

        if (status === 'pub-beta') {
          args = args.concat(['--tag', 'beta'])
        }

        runCmd(publishNpm, args, code => {
          if (code === 1) {
            console.log('正在尝试使用cnpm...')
            return runCmd('cnpm', args, code => {
              code ? process.exit(code) : done()
            })
          }
          done()
        })
      }
    })
  })
}

function __babelify(code, useESModules) {
  let stream = code.pipe(babel(babelConfig)).pipe(
    through2.obj(function z(file, encoding, next) {
      this.push(file.clone())
      next()
    })
  )

  if (useESModules) {
    stream = stream.pipe(
      stripCode({
        start_comment: '@remove-on-es-build-begin',
        end_comment: '@remove-on-es-build-end'
      })
    )
  }

  return stream.pipe(gulp.dest(useESModules ? esDir : libDir))
}

function dev(port) {
  let webpackDevConfig = require('../config/webpack.dev.config')
  const userConfigPath = path.join(cwd, 'webpack.config.js')
  const businessLine = getBusinessLine()
  const { name } = packageJson

  if (existsSync(userConfigPath)) {
    webpackDevConfig = webpackMerge(webpackDevConfig, require(userConfigPath))
  }

  const compiler = webpack(webpackDevConfig)
  const server = new WebpackDevServer(compiler, {
    clientLogLevel: 'none',
    hot: true,
    host: '127.0.0.1',
    port,
    https: true,
    noInfo: true,
    disableHostCheck: true, // host检查
    publicPath: `/${businessLine}/${name}/`
  });
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0)
      })
    })
  })

  server.listen(port)
  const url = `https://127.0.0.1:${port}/${businessLine}/${name}/`
  open(url)

  return new Promise(() => {
    compiler.hooks.done.tap('dev', () => {
      console.log(
        `open at: ${url}`
      )
    })
  })
}

function compile(moduleType) {
  process.env.BABEL_MODULE = moduleType
  const useESModules = moduleType !== 'commonjs'

  rimraf.sync(useESModules ? esDir : libDir)

  const assets = gulp
    .src(['src/**/*.@(png|svg|css)'])
    .pipe(gulp.dest(useESModules ? esDir : libDir))
  const source = ['src/**/*.js', 'src/**/*.ts']
  const result = gulp.src(source)
  const filesStream = __babelify(result, useESModules)

  return merge2([filesStream, assets])
}

function dist(program, done) {
  if (!program.keep) {
    rimraf.sync(path.join(cwd, 'dist', 'static'))
  }

  process.env.RUN_ENV = 'PRODUCTION'

  let webpackProdConfig = getWebPackProdConfig(program.single, program.analyz, program.keepconsole)
  const userConfigPath = path.join(cwd, 'webpack.config.js')

  if (existsSync(userConfigPath)) {
    webpackProdConfig = webpackProdConfig.map(config => {
      return webpackMerge(config, require(userConfigPath))
    })
  }

  webpack(webpackProdConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      done(1)
      return
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
      console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false
    })
    console.log(buildInfo)
    done(0)
  })
}

function pub(status, program, done) {
  const { version } = packageJson

  isCanPub(status, () => {
    let isPass = true
    gulp
      .src(`${cwd}/CHANGELOG.md`)
      .pipe(
        through2.obj(function(chunk, enc, callback) {
          const contents = `${chunk.contents}`
          const regRxp = new RegExp(`${version}`, 'g')
          if (!regRxp.test(contents) && status === 'pub') {
            isPass = false
            console.log(
              chalk.yellow(
                `Warning: 未同步 ${chalk.blueBright(
                    `v ${version}`
                  )} 版本的更新日志，请检查!`
              )
            )
          }
          callback()
        })
      )
      .pipe(gulp.dest(`${cwd}/`))
      .on('end', () => {
        if (isPass) {
          __publish(status, program, done)
        }
      })
  })
}

function unpub(done) {
  const { name, version } = packageJson

  if (__hasTag()) {
    execSync(`git tag -d ${version}`)
    execSync(`git push origin :refs/tags/${version}`)
    console.log()
    console.log(chalk.green(`success: 删除gitlab上的对应tag:${version}成功`))
  }

  runCmd(publishNpm, ['unpublish', `${name}@${version}`], () => {
    console.log()
    console.log(chalk.green(`success: 删除npm包上对应版本${version}成功`))
    done()
  })
}

function generateJSDoc(done) {
  const jsdocConfig = getJsdocConfig()

  gulp
    .src(
      [`${cwd}/src/**/*.js`, `${cwd}/src/**/*.ts`, `${cwd}/README.md`],
      { read: false }
    )
    .pipe(
      jsdoc(jsdocConfig, function() {
        console.log(chalk.green('Success: 文档生成成功'))
        done()
      })
    )
}

module.exports = {
  dev,
  compile,
  dist,
  pub,
  unpub,
  generateJSDoc
}
