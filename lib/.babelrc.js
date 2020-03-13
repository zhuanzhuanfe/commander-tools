module.exports = (modules) => {
  return {
    presets: [
      [require.resolve('@babel/preset-env'), {
        modules,
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'iOS >= 8',
            'Android >= 4',
          ],
        },
        useBuiltIns: 'usage',
        corejs: 3
      }]
    ],
    plugins: [
      [require.resolve('@babel/plugin-transform-runtime'), {
        corejs: 3
      }]
    ]
  }
}
