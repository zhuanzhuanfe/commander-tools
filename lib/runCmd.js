'use strict';

const getRunCmdEnv = require('./utils/getRunCmdEnv');

// console.log(getRunCmdEnv);

function runCmd(cmd, _args, fn) {
  const args = _args || [];
  const runner = require('cross-spawn')(cmd, args, {
    // keep color
    stdio: 'inherit',
    env: getRunCmdEnv(),
  });

  runner.on('close', (code) => {
    if (fn) {
      fn(code);
    }
  });
}

module.exports = runCmd;
