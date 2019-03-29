/* eslint-disable no-unused-vars */
module.exports = {
  plugins: {
    "postcss-import": {},
    autoprefixer: {
      browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9', 'Android >= 4', 'iOS >= 8']
    },
    "postcss-pxtorem": {
      rootValue: 75,
      unitPrecision: 2,
      propList: ['*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 2
    },
    cssnano: {
      autoprefixer: false,
      zindex: false,
      discardComments: { 
        removeAll: true 
      },
      reduceIdents: false
    }
  }
}