const webpack = require('./index')

module.exports = webpack.then(res => {
  return res.dev()
}).catch(err => {
  console.log(err);
})