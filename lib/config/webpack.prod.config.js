const fs = require('fs')
const os = require('os')
const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const chalk = require('chalk')
const deepAssign = require('deep-assign')

const postcssConfig = require('./postcss.config')
const files = fs.readdirSync(`${process.cwd()}/src`)
const entryObj = []

files.forEach((val) => {
  let filePath = path.join(process.cwd(), 'src', val)
  let stats = fs.statSync(filePath)

  if(stats.isFile() && /\.js$/.test(val) && val !== 'index.js') {
    entryObj.push({
      name: val.replace('.js', ''),
      file: [filePath],
      // [`${val}.min`]: [join(filePath, 'index.js')]
    })
  }
})

module.exports = function(single, analyz) {
  const pkg = require(path.join(process.cwd(), 'package.json'))
  const babelConfig = require('../utils/getBabelConfig')
  const pkgName = 'index'

  const config = {
    devtool: false,
    output: {
      path: path.join(process.cwd(), `./dist/static/js/${pkg.version}`),
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    resolve: {
      modules: ['node_modules', path.join(__dirname, '../node_modules')],
      extensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
      ],
      alias: {
        [pkg.name]: process.cwd(),
      },
    },
    node: [
      'child_process',
      'cluster',
      'dgram',
      'dns',
      'fs',
      'module',
      'net',
      'readline',
      'repl',
      'tls',
    ].reduce((acc, name) => Object.assign({}, acc, { [name]: 'empty' }), {}),
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: babelConfig,
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelConfig,
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader].concat([
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: Object.assign(
                {},
                postcssConfig,
                { sourceMap: true }
              ),
            },
          ]),
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader].concat([
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: Object.assign(
                {},
                postcssConfig,
                { sourceMap: true }
              ),
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
              },
            },
          ]),
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      new CaseSensitivePathsPlugin(),
      new webpack.BannerPlugin(`
        ${pkg.name} v${pkg.version}
        ${pkg.author ? '@author' + pkg.author : ''}
        Copyright 2020-present, zz.
      `),
      new webpack.ProgressPlugin((percentage, msg, addInfo) => {
        const stream = process.stderr
        if (stream.isTTY && percentage < 0.71) {
          stream.cursorTo(0)
          stream.write(`📦  ${chalk.magenta(msg)} (${chalk.magenta(addInfo)})`)
          stream.clearLine(1)
        } else if (percentage === 1) {
          console.log(chalk.green('\nwebpack: bundle build is now finished.'))
        }
      }),
    ],
  }

  if (process.env.npm_config_report || analyz) {
    config.plugins.push(new BundleAnalyzerPlugin())
  }

  if (process.env.RUN_ENV === 'PRODUCTION') {
    const entry = [path.join(process.cwd(), './src/index.js')]
    config.entry = {
      [`${pkgName}.min`]: entry,
    }
    config.externals = {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
      vue: {
        root: 'Vue',
        commonjs2: 'vue',
        commonjs: 'vue',
        amd: 'vue',
      },
    }
    config.output.library = pkg.name
    config.output.libraryTarget = 'umd'
    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: os.cpus().length,
          uglifyOptions: {
            output: {
              beautify: false,
              // 删除所有的注释
              // comments: false,
            },
            compress: {
              // 在UglifyJs删除没有用到的代码时不输出警告
              // warnings: false,
              // 删除所有的 `console` 语句
              drop_console: true,
              pure_funcs: ['console.log'],
              // 内嵌定义了但是只用到一次的变量
              collapse_vars: true,
              // 提取出出现多次但是没有定义成变量去引用的静态值
              reduce_vars: true,
            },
          },
          sourceMap: false
        }),
        new OptimizeCSSPlugin({
          cssProcessorOptions: {
            discardComments: {
              removeAll: true
            }
          }
        })
      ],
    }
    config.plugins = config.plugins.concat([
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      }),
    ])
    config.mode = 'production'

    const uncompressedConfig = deepAssign({}, config)
    uncompressedConfig.mode = 'development'
    uncompressedConfig.entry = {
      [pkgName]: entry,
    }

    let result = [config, uncompressedConfig]

    if (entryObj.length && !single) {
      entryObj.forEach(v => {
        result[1].entry[v.name] = v.file
        result[0].entry[v.name + '.min'] = v.file
      })
    }

    return result
  }

  return [config]
}
