module.exports = program => {
  const getBabelCommonConfig = require("./getBabelCommonConfig");
  const runCmd = require("./runCmd");
  const fs = require("fs");
  const existsSync = fs.existsSync;
  const chalk = require("chalk");
  const webpack = require("webpack");
  const webpackMerge = require("webpack-merge");
  const babel = require("gulp-babel");
  const merge2 = require("merge2");
  const { execSync } = require("child_process");
  const through2 = require("through2");
  const gulp = require("gulp");
  const path = require("path");
  const rimraf = require("rimraf");
  const packageJson = require(`${process.cwd()}/package.json`);
  const argv = require("minimist")(process.argv.slice(2));
  const stripCode = require("gulp-strip-code");
  const gitBranch = require("current-git-branch");
  const replaceLib = require("./replaceLib");
  const getWebpackConfig = require("./getWebpackConfig");
  const cwd = process.cwd();
  const libDir = path.join(cwd, "lib");
  const esDir = path.join(cwd, "es");
  const repoName = require("git-repo-name");
  const WebpackDevServer = require("webpack-dev-server");

  function checkRegistry() {
    let checkRegistryPass = false;
    ["npm"].map(item => {
      const registry = execSync(`${item} config get registry`).toString();
      if (
        [
          "https://rcnpm.zhuanspirit.com/",
          "http://rcnpm.zhuaninc.com/"
        ].includes(registry.replace(/\s/g, ""))
      )
        checkRegistryPass = true;
    });
    if (!checkRegistryPass)
      throw `请设置：npm config set registry https://rcnpm.zhuanspirit.com`;
  }

  const publishNpm = process.platform === "win32" ? "npm.cmd" : "npm";

  function dist(done) {
    rimraf.sync(path.join(cwd, "dist", "static"));
    process.env.RUN_ENV = "PRODUCTION";
    let webpackConfig = getWebpackConfig(false);
    if (fs.existsSync(path.join(cwd, "webpack.config.js"))) {
      webpackConfig.map(v => {
        return webpackMerge(v, require(path.join(cwd, "webpack.config.js")));
      });
    }
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      const buildInfo = stats.toString({
        colors: true,
        children: true,
        chunks: false,
        modules: false,
        chunkModules: false,
        hash: false,
        version: false
      });
      console.log(buildInfo);
      done(0);
    });
  }

  function babelify(js, modules) {
    const babelConfig = getBabelCommonConfig(modules);
    delete babelConfig.cacheDirectory;
    if (modules === false) {
      babelConfig.plugins.push(replaceLib);
    } else {
      babelConfig.plugins.push(
        require.resolve("babel-plugin-add-module-exports")
      );
    }
    let stream = js.pipe(babel(babelConfig)).pipe(
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        next();
      })
    );
    if (modules === false) {
      stream = stream.pipe(
        stripCode({
          start_comment: "@remove-on-es-build-begin",
          end_comment: "@remove-on-es-build-end"
        })
      );
    }
    return stream.pipe(gulp.dest(modules === false ? esDir : libDir));
  }

  function compile(modules) {
    rimraf.sync(modules !== false ? libDir : esDir);
    const assets = gulp
      .src(["src/**/*.@(png|svg|css)"])
      .pipe(gulp.dest(modules === false ? esDir : libDir));
    const source = ["src/**/*.js"];
    const result = gulp.src(source);
    const filesStream = babelify(result, modules);
    return merge2([filesStream, assets]);
  }

  function pub(status, done) {
    checkRegistry()
    dist(code => {
      if (code) {
        done(code);
        return;
      }
      tag(status).then(result => {
        if (result) {
          publish(status, done);
        }
      });
    });
  }

  function publish(status, done) {
    checkRegistry()
    let args = ["publish"];
    if (status === "pub-beta") {
      args = args.concat(["--tag", "beta"]);
    }
    try {
      runCmd(publishNpm, args, code => {
        if (code !== 0 && code === 1) {
          console.log("正在尝试使用cnpm...");
          return runCmd("cnpm", args, code => {
            done();
          });
        }
        done();
      });
    } catch (error) {}
  }

  function unpub(done) {
    const name = packageJson.name;
    const version = packageJson.version;
    const tagList = execSync(`git tag -l`);
    const regExp = new RegExp(`${version}[\n\t\r]`, "g");
    const isReg = regExp.test(tagList.toString());
    if (isReg) {
      execSync(`git tag -d ${version}`);
      execSync(`git push origin :refs/tags/${version}`);
      console.log();
      console.log(chalk.green(`success: 删除gitlab上的对应tag:${version}成功`));
    }
    runCmd(publishNpm, ["unpublish", `${name}@${version}`], code => {
      console.log();
      console.log(chalk.green(`success: 删除npm包上对应版本${version}成功`));
      done();
    });
  }

  function tag(tagString) {
    return new Promise((resolve, reject) => {
      const { version } = packageJson;
      const tagList = execSync(`git tag -l`);
      const regExp = new RegExp(`${version}[\n\t\r]`, "g");
      const isReg = regExp.test(tagList.toString());
      const curBranch = gitBranch();
      const gitname = repoName.sync();
      if (!tagString && curBranch !== `${gitname}-develop`) {
        console.log();
        console.log(
          chalk.red(
            `Fail: 不能在当前分支下发布正式版本，请到${gitname}-develop分支进行。`
          )
        );
        console.log();
        console.log(
          chalk.yellow(
            `Warning: 当前分支只能发布测试版，发布测试版请使用命令 ${chalk.blueBright(
              "npm run pub-beta"
            )}`
          )
        );
        resolve(false);
      } else {
        try {
          if (isReg) {
            console.log();
            console.log(
              chalk.red(
                `fail: 发布失败，gitlab仓库已存在当前版本分支(${curBranch}/${version})标签，请修改当前包的版本`
              )
            );
            resolve(false);
          } else {
            execSync(`git tag ${version}`);
            execSync(`git push origin ${version}:${version}`);
            execSync(`git push origin ${curBranch}:${curBranch}`);
            console.log();
            console.log(
              chalk.green(
                `success: 代码推送成功，生成标签(${curBranch}/${version})`
              )
            );
            resolve(true);
          }
        } catch (err) {
          reject(err);
          console.log(chalk.red("fail: tagged"));
        }
      }
    });
  }

  gulp.task("dist", done => {
    dist(done);
  });

  gulp.task("compile", ["compile-with-es"], () => {
    compile();
  });

  gulp.task("compile-with-es", () => {
    compile(false);
  });

  gulp.task("check-git", done => {
    if (process.platform === "win32") return done();
    runCmd("git", ["status", "--porcelain"], (code, result) => {
      if (/^\?\?/m.test(result)) {
        return done(`There are untracked files in the working tree.\n${result}
        `);
      }
      if (/^([ADRM]| [ADRM])/m.test(result)) {
        return done(`There are uncommitted changes in the working tree.\n${result}
        `);
      }
      return done();
    });
  });

  /**
   * 发布npm包版本
   */

  const isCanPub = require("./utils/is-can-pub");

  const pubProcess = (status, done) => {
    isCanPub(status, () => {
      let isPass = true;
      gulp
        .src(`${process.cwd()}/CHANGELOG.md`)
        .pipe(
          through2.obj(function(chunk, enc, callback) {
            const contents = `${chunk.contents}`;
            const regRxp = new RegExp(`##\\s+${packageJson.version}`, "g");
            if (!regRxp.test(contents) && status === "pub") {
              isPass = false;
              console.log(
                chalk.yellow(
                  `Warning: 还没有写 ${chalk.blueBright(
                    `v ${packageJson.version}`
                  )} 版本的更新日志，请检查!`
                )
              );
            }
            callback();
          })
        )
        .pipe(gulp.dest(`${process.cwd()}/`))
        .on("end", () => {
          if (isPass) {
            pub(status, done);
          }
        });
    });
  };
  gulp.task(
    "pub",
    ["build-doc", "doc-upload", "check-git", "compile"],
    done => {
      pubProcess("pub", done);
    }
  );

  gulp.task("pub-beta", ["check-git", "compile"], done => {
    pubProcess("pub-beta", done);
  });

  /**
   * 删除npm包版本
   */
  gulp.task("unpub", done => {
    isCanPub("unpub", () => {
      unpub(done);
    });
  });

  /**
   * 生成开发文档
   */
  const merge = require("deepmerge");
  const jsdoc = require("gulp-jsdoc3");
  const replace = require("gulp-replace");
  const origin = require("remote-origin-url");

  gulp.task("build-doc", function(cb) {
    const package = require(`${process.cwd()}/package.json`);
    const configOri = require(path.join(__dirname, "../", "jsdoc.json"));
    const jsdocConfDir = path.join(process.cwd(), "jsdoc.conf.json");
    const jsdocDir = path.join(process.cwd(), "jsdoc.json");
    let config = {};

    if (existsSync(jsdocConfDir)) {
      config = merge(configOri, require(jsdocConfDir))
    } else if (existsSync(jsdocDir)) {
      config = merge(configOri, require(jsdocDir))
    } else {
      config = configOri
    }

    const version = package.version;
    const name = package.name.replace(/\//, "\\/");
    const originUrl = origin.sync();
    const regExp = new RegExp(`(${name}@)[\\d+\\.]+\\d+(-beta\\.\\d+)?`, "gi");
    const regExp2 = new RegExp("(v\\=)[\\d+\\.]+\\d+(-beta\\.\\d+)?", "gi");
    const regExp3 = new RegExp(`gitlab.zhuanspirit.com/${name}`, "gi");
    const regExp4 = new RegExp(`/[\\d+\\.]+\\d+(-beta\\.\\d+)?/`, "gi");

    gulp
      .src([`${process.cwd()}/README.md`])
      .pipe(replace(regExp, `$1${version}`))
      .pipe(replace(regExp2, `$1${version}`))
      .pipe(replace(regExp3, originUrl))
      .pipe(replace(regExp4, `/${version}/`))
      .pipe(gulp.dest(`${process.cwd()}/`))
      .on("end", () => {
        console.log("当前版本：", chalk.yellow(version));
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
              console.log(chalk.green(`Success: 文档生成成功`));
              cb();
            })
          );
      });
  });

  /**
   * 预览文档
   */
  const browserSync = require("browser-sync").create();
  const reload = browserSync.reload;

  gulp.task("doc", ["build-doc"], function() {
    browserSync.init({
      server: {
        baseDir: `${process.cwd()}/docs`
      }
    });
    gulp.watch(
      [`${process.cwd()}/src/**/*`, `${process.cwd()}/README.md`],
      ["build-doc"]
    );
    gulp.watch(`${process.cwd()}/docs/**/*.html`).on("change", reload);
  });

  /**
   * 上传文档到ftp
   **/
  const gutil = require("gulp-util");
  const ftp = require("vinyl-ftp");

  gulp.task("doc-upload", ["build-doc"], function() {
    const conn = ftp.create({
      host: "static.ftp.zhuaninc.com",
      user: "fesdk",
      password: "3kmYLKw4er4tP",
      parallel: 10,
      log: gutil.log
    });

    const pipe = gulp
      .src(`${process.cwd()}/${program.docsDirName || "docs"}/**/*`)
      .pipe(
        conn.dest(`/${program.groupName || "common"}/${packageJson.name}/`)
      )
      .on("end", () => {
        const open = require("open");
        open(
          `https://fe.zhuanspirit.com/${program.groupName || "common"}/${
            packageJson.name
          }`
        );
      });
    return pipe;
  });

  /**
   * dev模式
   */
  gulp.task("dev", function(done) {
    const pkgname = packageJson.name;
    const curdir = path.join(__dirname, "../");
    const port = 8006;
    const execDev = () => {
      const open = require("open");
      const compiler = webpack(require("./webpack.dev.config"));
      const server = new WebpackDevServer(compiler, {
        clientLogLevel: "none",
        hot: true,
        host: "127.0.0.1",
        https: false,
        quiet: true,
        port,
        disableHostCheck: true, // host检查
        // open: true,
        // openPage: `${packageJson.name}/`,
        publicPath: `/common/${packageJson.name}/`
      });
      ["SIGINT", "SIGTERM"].forEach(signal => {
        process.on(signal, () => {
          server.close(() => {
            process.exit(0);
          });
        });
      });

      server.listen(port);
      open(`http://127.0.0.1:${port}/common/${packageJson.name}/`);

      new Promise(() => {
        compiler.hooks.done.tap("dev", stats => {
          console.log(
            `open at: http://127.0.0.1:${port}/common/${packageJson.name}/`
          );
        });
      });
    };
    const existDemo = existsSync(path.resolve(`${process.cwd()}/demo`));
    if (!existDemo) {
      const files = [];
      if (!existDemo) {
        files.push(path.join(curdir, `demo/**/*`));
      }
      gulp
        .src(files)
        .pipe(replace(/{{name}}/g, pkgname))
        .pipe(gulp.dest(`${process.cwd()}/demo`))
        .on("end", () => {
          execDev();
        });
    } else {
      execDev();
    }
  });
};
