const { execSync } = require('child_process');
const chalk = require('chalk');
const packageJson = require(`${process.cwd()}/package.json`);
const existNpm = require('npm-name-exists');

module.exports = function(sign = 'pub', cb) {
  existNpm(packageJson.name).then(v => {
    if (v) {
      const name = execSync('git config --get user.name');
      const username = `${name}`.replace(/[\n\t\r]/g, '');
      const publishNpm = process.env.PUBLISH_NPM_CLI || 'npm';
      const onwerlist = execSync(`${publishNpm} owner ls`);
      const list = `${onwerlist}`.replace(/[\n\r\t]+/g, '&&')
      const regExp = new RegExp(`${username}`, 'g');
      const version = packageJson.version;
      if (/^\d+\.\d+\.\d+$/.test(version) && sign === 'pub-beta') {
        console.log();
        console.log(chalk.red('Fail: 版本号不符合测试包版本号规则，正确示例：1.0.0-beta.0'));
        return;
      }
      if (regExp.test(list)) {
        cb();
      } else {
        console.log();
        console.log(chalk.yellow(`Warning：您没有权限${sign === 'pub' ? '发布' : '删除'}${chalk.blueBright(`${packageJson.name}@${packageJson.version}`)}包，请联系管理员分配权限！`));
        console.log(chalk.blueBright(`Info: 您当前用户名是 ${name}`));
        console.log(chalk.blueBright(`Info: 当面sdk的权限列表如下：`));
        console.log(chalk.blueBright(`      ${onwerlist}`));
        console.log(chalk.blueBright(`Info: 如果用户名不正确，请通过 ${chalk.yellow('git config')} 命令重新设置`));
        console.log();
      }
    }
  })
};