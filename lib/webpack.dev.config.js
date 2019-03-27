const webpack = require('webpack');
const path = require('path');
const ErudaWebpackPlugin = require('eruda-webpack-plugin');
const postcssConfig = require('./postcssConfig')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const packageJson = require(`${process.cwd()}/package.json`);

const resolve = (dir = '') => {
  return path.join(process.cwd(), dir);
};

const commonDefine = {
  'process.env':  {
    NODE_ENV: '"development"'
  },
}
module.exports = {
  context: resolve(),
  entry: {
    'index': resolve('demo/app.js'),
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: `/${packageJson.name}/`,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json', '.scss','.ts','.tsx'],
    alias: {
      [packageJson.name]: resolve('src/index.js')
    }
  },
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
        options: require(resolve('lib/.babelrc.js'))(false),
        exclude: [resolve('node_modules')]
      }
    ]
  },
  devServer: {
    clientLogLevel: 'warning',
    // historyApiFallback: true,
    hot: true,
    compress: true,
    host: '0.0.0.0',
    https: false,
    port: 8005,
    open: true,
    openPage: `${packageJson.name}/`,
    publicPath: `/${packageJson.name}/`,
    // overlay: false,
    // quiet: true, // necessary for FriendlyErrorsPlugin
    disableHostCheck: true, // host检查
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