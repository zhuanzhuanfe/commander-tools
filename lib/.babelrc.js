module.exports = (modules) => {
  return {
    presets: [
      [require.resolve('babel-preset-env'), {
        modules,
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'ie >= 8',
            'iOS >= 8',
            'Android >= 4',
          ],
        },
      }],
      require.resolve('babel-preset-stage-0'),
    ],
    plugins: [
      [require.resolve('babel-plugin-transform-runtime'), {
        "helpers": false,
        "polyfill": false,
        "regenerator": true
      }]
    ]
  };
}
