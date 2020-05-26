const fs = require('fs')
const gulp = require('gulp')
const path = require('path')
const chalk = require('chalk')
const through2 = require('through2')

const runCmd = require('./runCmd')
const getBusinessLine = require('./utils/getBusinessLine')
const { dev, compile, dist, pub, unpub } = require('./utils')
const packageJson = require(`${process.cwd()}/package.json`)

const existsSync = fs.existsSync

module.exports = program => {
  /**
   * eslint 校验
   */
  gulp.task('lint', done => {
    console.log(chalk.green('running lint'))

    const { staged, fix } = program

    if (staged) {
      const configFile = path.join(__dirname, './config/lint-staged.config.js')
      process.env.ESLINT_FIX = fix

      runCmd('lint-staged', ['--config', configFile], code => {
        code ? process.exit(code) : done()
      })
    } else {
      const args = fix ? ['--fix', 'src/**'] : ['src/**']

      runCmd('eslint', args, () => {
        done()
      })
    }
  })

  /**
   * commit 校验
   */
  gulp.task('commitlint', done => {
    console.log(chalk.green('running commitlint'))

    const configFile = path.join(__dirname, './config/commitlint.config.js')

    runCmd(
      'commitlint',
      ['--config', configFile, '-E', 'HUSKY_GIT_PARAMS'],
      code => (code ? process.exit(code) : done())
    )
  })

  /**
   * dev 模式
   */
  gulp.task('dev', () => {
    console.log(chalk.green('running dev'))

    const { name } = packageJson
    const existDemo = existsSync(path.resolve(`${process.cwd()}/demo`))

    if (!existDemo) {
      const files = [path.join(__dirname, '../demo/**/*')]
      const pipe = gulp
        .src(files)
        .pipe(replace(/{{name}}/g, name))
        .pipe(gulp.dest(`${process.cwd()}/demo`))
        .on('end', () => {
          dev()
        })

      return pipe
    } else {
      return dev()
    }
  })

  /**
   * 生成外链
   */
  gulp.task('dist', done => {
    console.log(chalk.green('running dist'))

    dist(program, done)
  })

  /**
   * 生成 cjs 模块
   */
  gulp.task('compile-lib', () => {
    console.log(chalk.green('running compile-lib'))

    return compile('commonjs')
  })

  /**
   * 生成 esm 模块
   */
  gulp.task('compile-es', () => {
    console.log(chalk.green('running compile-es'))

    return compile(false)
  })

  gulp.task('compile', gulp.series(
    'compile-es',
    'compile-lib',
    done => done()
  ))

  /**
   * 校验 git
   */
  gulp.task('check-git', done => {
    console.log(chalk.green('running check-git'))

    if (process.platform === 'win32') return done()

    runCmd('git', ['status', '--porcelain'], (code, result) => {
      if (/^\?\?/m.test(result)) {
        return done(`There are untracked files in the working tree.\n${result}
        `)
      }
      if (/^([ADRM]| [ADRM])/m.test(result)) {
        return done(`There are uncommitted changes in the working tree.\n${result}
        `)
      }
      return done()
    })
  })

  /**
   * 构建文档
   */
  const merge = require('deepmerge')
  const jsdoc = require('gulp-jsdoc3')
  const replace = require('gulp-replace')
  const origin = require('remote-origin-url')

  gulp.task('build-doc', done => {
    console.log(chalk.green('running build-doc'))

    const configOri = require(path.join(__dirname, '../', 'jsdoc.json'))
    const jsdocConfDir = path.join(process.cwd(), 'jsdoc.conf.json')
    const jsdocDir = path.join(process.cwd(), 'jsdoc.json')
    let config = {}

    if (existsSync(jsdocConfDir)) {
      config = merge(configOri, require(jsdocConfDir))
    } else if (existsSync(jsdocDir)) {
      config = merge(configOri, require(jsdocDir))
    } else {
      config = configOri
    }

    const version = packageJson.version
    const name = packageJson.name.replace(/\//, '\\/')
    const originUrl = origin.sync()
    const regExp = new RegExp(`(${name}@)[\\d+\\.]+\\d+(-beta\\.\\d+)?`, 'gi')
    const regExp2 = new RegExp('(v\\=)[\\d+\\.]+\\d+(-beta\\.\\d+)?', 'gi')
    const regExp3 = new RegExp(`gitlab.zhuanspirit.com/${name}`, 'gi')
    const regExp4 = new RegExp('/[\\d+\\.]+\\d+(-beta\\.\\d+)?/', 'gi')

    gulp
      .src([`${process.cwd()}/README.md`])
      .pipe(replace(regExp, `$1${version}`))
      .pipe(replace(regExp2, `$1${version}`))
      .pipe(replace(regExp3, originUrl))
      .pipe(replace(regExp4, `/${version}/`))
      .pipe(gulp.dest(`${process.cwd()}/`))
      .on('end', () => {
        console.log('当前版本：', chalk.yellow(version))
        gulp
          .src(
            [
              `${process.cwd()}/README.md`,
              `${process.cwd()}/src/**/*.js`,
              `${process.cwd()}/src/**/*.ts`
            ],
            { read: false }
          )
          .pipe(
            jsdoc(config, function() {
              console.log(chalk.green('Success: 文档生成成功'))
              done()
            })
          )
      })
  })

  /**
   * 本地运行文档
   */
  const browserSync = require('browser-sync').create()
  const reload = browserSync.reload

  gulp.task('doc', gulp.series('build-doc', done => {
    console.log(chalk.green('running doc'))

    browserSync.init({
      server: {
        baseDir: `${process.cwd()}/docs`
      }
    })

    gulp.watch(
      [`${process.cwd()}/src/**/*`, `${process.cwd()}/README.md`],
      gulp.series('build-doc')
    )

    gulp.watch(`${process.cwd()}/docs/**/*.html`).on('change', reload)

    done()
  }))

  gulp.task('build', gulp.series(
    'compile-es',
    'compile-lib',
    'dist',
    'build-doc',
    done => done()
  ))

  const gutil = require('gulp-util')
  const ftp = require('vinyl-ftp')
  const businessLine = getBusinessLine(program)

  /**
   * 上传文档
   **/
  gulp.task('doc-upload', gulp.series('build-doc', () => {
    console.log(chalk.green('running doc-upload'))

    const conn = ftp.create({
      host: 'static.ftp.zhuaninc.com',
      user: 'fesdk',
      password: '3kmYLKw4er4tP',
      parallel: 10,
      log: gutil.log
    })

    const pipe = gulp
      .src(`${process.cwd()}/${program.docsDirName || 'docs'}/**/*`)
      .pipe(conn.dest(`/${businessLine}/${packageJson.name}/`))
      .on('end', () => {
        const open = require('open')
        open(`https://fe.zhuanspirit.com/${businessLine}/${packageJson.name}/`)
      })

    return pipe
  }))

  const isCanPub = require('./utils/isCanPub')

  const pubProcess = (status, done) => {
    isCanPub(status, () => {
      let isPass = true
      gulp
        .src(`${process.cwd()}/CHANGELOG.md`)
        .pipe(
          through2.obj(function(chunk, enc, callback) {
            const contents = `${chunk.contents}`
            const regRxp = new RegExp(`##\\s+${packageJson.version}`, 'g')
            if (!regRxp.test(contents) && status === 'pub') {
              isPass = false
              console.log(
                chalk.yellow(
                  `Warning: 还没有写 ${chalk.blueBright(
                    `v ${packageJson.version}`
                  )} 版本的更新日志，请检查!`
                )
              )
            }
            callback()
          })
        )
        .pipe(gulp.dest(`${process.cwd()}/`))
        .on('end', () => {
          if (isPass) {
            pub(program, status, done)
          }
        })
    })
  }

  /**
   * 发布 npm 包版本
   */
  gulp.task('pub',
    gulp.series(
      'check-git',
      'compile-es',
      'compile-lib',
      'doc-upload',
      done => {
        console.log(chalk.green('running pub'))

        pubProcess('pub', done)
      }
    )
  )

  /**
   * 发布 beta 版 npm 包版本
   */
  gulp.task('pub-beta',
    gulp.series(
      'check-git',
      'compile-es',
      'compile-lib',
      done => {
        console.log(chalk.green('running pub-beta'))

        pubProcess('pub-beta', done)
      }
    )
  )

  /**
   * 删除npm包版本
   */
  gulp.task('unpub', done => {
    console.log(chalk.green('running unpub'))

    isCanPub('unpub', () => {
      unpub(done)
    })
  })
}
