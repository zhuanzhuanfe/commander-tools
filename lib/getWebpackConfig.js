const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const deepAssign = require('deep-assign');
const chalk = require('chalk');
const replaceLib = require('./replaceLib');
const postcssConfig = require('./postcssConfig');
const fs = require('fs');
const files = fs.readdirSync(`${process.cwd()}/src`);
const join = path.join;
const entryObj = [];
files.forEach((val) => {
  let fPath = join(process.cwd(), 'src', val);
  let stats = fs.statSync(fPath);
  if(stats.isFile() && /\.js$/.test(val) && val !== 'index.js') {
    entryObj.push({
      name: val.replace('.js', ''),
      file: [fPath],
      // [`${val}.min`]: [join(fPath, 'index.js')]
    });
  }
});
// console.log(entryObj);

module.exports = function (modules) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const babelConfig = require('./getBabelCommonConfig')(modules || false);
  const pkgName = 'index';
  let result = [];
  const pluginImportOptions = [
    {
      style: true,
      libraryName: pkg.name,
      libraryDirectory: 'src',
    },
  ];

  // if (pkg.name !== '@zz/perf') {
  //   pluginImportOptions.push({
  //     style: 'css',
  //     libraryDirectory: 'es',
  //     libraryName: '@zz/perf',
  //   });
  // }

  babelConfig.plugins.push([
    require.resolve('babel-plugin-import'),
    pluginImportOptions,
  ]);

  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  }

  const config = {
    // devtool: 'source-map',
    devtool: false,

    output: {
      path: path.join(process.cwd(), `./dist/static/js/${pkg.version}`),
      filename: '[name].js',
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
      // noParse: [/moment.js/],
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
          use: ExtractTextPlugin.extract({
            use: [
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
            ],
          }),
        },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            use: [
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
            ],
          }),
        },
      ],
    },

    plugins: [
      new ExtractTextPlugin({
        filename: '[name].css',
        disable: false,
        allChunks: true,
      }),
      new CaseSensitivePathsPlugin(),
      new webpack.BannerPlugin(`
${pkg.name} v${pkg.version}
${pkg.author ? '@author' + pkg.author : ''}
Copyright 2018-present, zz.
      `),
      new webpack.ProgressPlugin((percentage, msg, addInfo) => {
        const stream = process.stderr;
        if (stream.isTTY && percentage < 0.71) {
          stream.cursorTo(0);
          stream.write(`📦  ${chalk.magenta(msg)} (${chalk.magenta(addInfo)})`);
          stream.clearLine(1);
        } else if (percentage === 1) {
          console.log(chalk.green('\nwebpack: bundle build is now finished.'));
        }
      }),
    ],
  };

  if (process.env.RUN_ENV === 'PRODUCTION') {
    const entry = [path.join(process.cwd(), './src/index.js')];
    // const childMinEntry = {};
    // for (let e in entryObj) {
    //   if (entryObj.hasOwnProperty(e) && /\.min$/.test(e)) {
    //     childMinEntry[e] = entryObj[e];
    //   }
    // }

    config.entry = {
      [`${pkgName}.min`]: entry,
    };
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
    };
    config.output.library = pkg.name;
    config.output.libraryTarget = 'umd';
    
    const uncompressedConfig = deepAssign({}, config);
    
    config.plugins = config.plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        output: {
          ascii_only: true,
        },
        compress: {
          warnings: false,
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      }),
    ]);

    // const childEntry = {};
    // for (let e in entryObj) {
    //   if (entryObj.hasOwnProperty(e) && !/\.min$/.test(e)) {
    //     childEntry[e] = entryObj[e];
    //   }
    // }

    uncompressedConfig.entry = {
      [pkgName]: entry,
    };

    uncompressedConfig.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }));

    let result = [config, uncompressedConfig];
    if (entryObj.length) {
      entryObj.forEach(v => {
        result[1].entry[v.name] = v.file
        result[0].entry[v.name + '.min'] = v.file
      });
    }
    return result;
  }
  return [config];
};
