module.exports = (api) => {
  const { BABEL_MODULE, RUN_ENV } = process.env;
  const useESModules = BABEL_MODULE !== 'commonjs' && RUN_ENV !== 'PRODUCTION';

  api && api.cache(false);

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
        corejs: 2
      }]
    ],
    plugins: [
      [require.resolve('@babel/plugin-transform-runtime'), {
        useESModules,
        corejs: 2
      }],
      [require.resolve('@babel/plugin-proposal-decorators'), { "legacy": true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { "loose": true }]
    ]
  }
}
