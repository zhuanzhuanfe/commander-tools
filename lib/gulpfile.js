const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const gulp = require('gulp')
const fancyLog = require('fancy-log')
const replace = require('gulp-replace')
const origin = require('remote-origin-url')
const browserSync = require('browser-sync')
const ftp = require('vinyl-ftp')
const open = require('open')

const runCmd = require('./runCmd')
const isCanPub = require('./utils/isCanPub')
const eslintConfig = require('./utils/getEslintConfig')
const prettierConfig = require('./utils/getPrettierConfig')
const getBusinessLine = require('./utils/getBusinessLine')
const { dev, compile, dist, pub, unpub, generateJSDoc } = require('./utils')
const packageJson = require(`${process.cwd()}/package.json`)

const cwd = process.cwd()
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
      const prettierArgs = ['--config', prettierConfig, '--write', 'src/**/*.{js,jsx,ts,tsx}']
      const eslintArgs = ['--config', eslintConfig, 'src/**']

      if (fix) {
        eslintArgs.push('--fix')

        runCmd('prettier', prettierArgs, () => {
          runCmd('eslint', eslintArgs, () => {
            done()
          })
        })
      } else {
        runCmd('eslint', eslintArgs, () => {
          done()
        })
      }
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
    const existDemo = existsSync(path.resolve(`${cwd}/demo`))

    if (!existDemo) {
      const files = [path.join(__dirname, '../demo/**/*')]
      const pipe = gulp
        .src(files)
        .pipe(replace(/{{name}}/g, name))
        .pipe(gulp.dest(`${cwd}/demo`))
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
  gulp.task('build-doc', done => {
    console.log(chalk.green('running build-doc'))

    const version = packageJson.version
    const name = packageJson.name.replace(/\//, '\\/')
    const originUrl = origin.sync()
    const regExp = new RegExp(`(${name}@)[\\d+\\.]+\\d+(-beta\\.\\d+)?`, 'gi')
    const regExp2 = new RegExp('(v\\=)[\\d+\\.]+\\d+(-beta\\.\\d+)?', 'gi')
    const regExp3 = new RegExp(`gitlab.zhuanspirit.com/${name}`, 'gi')
    const regExp4 = new RegExp('/[\\d+\\.]+\\d+(-beta\\.\\d+)?/', 'gi')

    gulp
      .src([`${cwd}/README.md`])
      .pipe(replace(regExp, `$1${version}`))
      .pipe(replace(regExp2, `$1${version}`))
      .pipe(replace(regExp3, originUrl))
      .pipe(replace(regExp4, `/${version}/`))
      .pipe(gulp.dest(`${cwd}/`))
      .on('end', () => {
        console.log('当前版本：', chalk.yellow(version))

        generateJSDoc(done)
      })
  })

  /**
   * 本地运行文档
   */
  gulp.task('doc', gulp.series('build-doc', done => {
    console.log(chalk.green('running doc'))

    const browser = browserSync.create()

    browser.init({
      server: {
        baseDir: `${cwd}/docs`
      }
    })

    gulp.watch(
      [`${cwd}/src/**/*.js`, `${cwd}/src/**/*.ts`, `${cwd}/README.md`],
      generateJSDoc
    )

    gulp.watch(`${cwd}/docs/**/*.html`).on('all', browser.reload)

    done()
  }))

  /**
   * 上传文档
   **/
  gulp.task('doc-upload', gulp.series('build-doc', () => {
    console.log(chalk.green('running doc-upload'))

    const businessLine = getBusinessLine(program)
    const { name } = packageJson
    const conn = ftp.create({
      host: 'static.ftp.zhuaninc.com',
      user: 'fesdk',
      password: '3kmYLKw4er4tP',
      parallel: 10,
      log: fancyLog
    })

    const pipe = gulp
      .src(`${cwd}/${program.docsDirName || 'docs'}/**/*`)
      .pipe(conn.dest(`/${businessLine}/${name}/`))
      .on('end', () => {
        console.log(chalk.green('Success: 文档上传成功'))
        open(`https://fe.zhuanspirit.com/${businessLine}/${name}/`)
      })

    return pipe
  }))

  /**
   * 构建代码和文档
   */
  gulp.task('build', gulp.series(
    'compile-es',
    'compile-lib',
    'dist',
    'build-doc',
    done => done()
  ))

  /**
   * 发布 npm 正式包
   */
  gulp.task('pub',
    gulp.series(
      'check-git',
      'compile-es',
      'compile-lib',
      'doc-upload',
      done => {
        console.log(chalk.green('running pub'))

        pub('pub', program, done)
      }
    )
  )

  /**
   * 发布 npm beta 包
   */
  gulp.task('pub-beta',
    gulp.series(
      'check-git',
      'compile-es',
      'compile-lib',
      done => {
        console.log(chalk.green('running pub-beta'))

        pub('pub-beta', program, done)
      }
    )
  )

  /**
   * 删除 npm 包
   */
  gulp.task('unpub', done => {
    console.log(chalk.green('running unpub'))

    isCanPub('unpub', () => {
      unpub(done)
    })
  })
}
