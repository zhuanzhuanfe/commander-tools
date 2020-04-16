const webpack = require('webpack');
const path = require('path');
const ErudaWebpackPlugin = require('eruda-webpack-plugin');
const postcssConfig = require('./postcssConfig')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const packageJson = require(`${process.cwd()}/package.json`);
const docConfig = require(`${process.cwd()}/doc.config.json`);
const businessLine = docConfig ? docConfig.businessLine : 'common';

const resolve = (dir = '') => {
  return path.join(process.cwd(), dir);
};

const babelConfig = require('./getBabelCommonConfig')(false);

const commonDefine = {
  'process.env':  {
    NODE_ENV: '"development"'
  },
}

module.exports = {
  context: resolve(),
  entry: {
    'index': resolve('demo/app.js')
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: `/${businessLine}/${packageJson.name}/`,
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json', '.scss','.ts','.tsx'],
    alias: {
      [packageJson.name]: resolve('src/index.js')
    }
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: false }
          },
          {
            loader: 'postcss-loader',
            options: Object.assign(
              {},
              postcssConfig,
              { sourceMap: false }
            ),
          }
        ],
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: babelConfig,
        exclude: [resolve('node_modules')]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(commonDefine),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    new ErudaWebpackPlugin(),
    new SimpleProgressWebpackPlugin({
      format: 'compact'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('demo/index.html'), // 模板路径
      inject: true, // js插入位置
      chunksSortMode: 'manual',
      chunks: ['vendor', 'index']
    }),
  ]
};
