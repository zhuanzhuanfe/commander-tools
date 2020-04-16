module.exports = (api) => {
  const { BABEL_MODULE, RUN_ENV, NODE_ENV } = process.env;
  const useESModules =
    BABEL_MODULE !== 'commonjs' &&
    RUN_ENV !== 'PRODUCTION' &&
    NODE_ENV !== 'test';

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
      [require.resolve('@babel/plugin-transform-runtime'), { useESModules }],
      [require.resolve('@babel/plugin-proposal-decorators'), { "legacy": true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { "loose": true }]
    ]
  }
}
