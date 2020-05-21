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
        useBuiltIns: 'usage',
        corejs: 3
      }]
    ],
    plugins: [
      [require.resolve('@babel/plugin-transform-runtime'), { useESModules }]
    ]
  }
}
