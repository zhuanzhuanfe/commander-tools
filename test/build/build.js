const merge = require('webpack-merge')
const webpack = require('./index')
const offlineCfg = require('../config/offline.js')
const webpackOffline = require('@zz/webpack-offline')(offlineCfg)

module.exports = webpack.then(res => {
  webpackOffline.then(offCfg => {
    res.prodWebpackConfig = merge(res.prodWebpackConfig, offCfg)
    return true
  }).then(d => {
    res.build()
  })
}).catch(err => {
  console.log(err);
})