module.exports = (api) => {
  const useESModules = process.env.BABEL_MODULE !== 'commonjs';

  api.cache(false);

  return {
    presets: [
      [require.resolve('@babel/preset-env'), {
        modules: useESModules ? false : 'commonjs',
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
        useESModules,
        corejs: 3
      }]
    ]
  }
}
