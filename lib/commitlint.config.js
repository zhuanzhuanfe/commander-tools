const path = require('path')

module.exports = {
  extends: [path.join(process.cwd(), 'node_modules/@zz-common/vue-cli-plugin-commitlint/lib/lint')]
};
