const prettierConfig = require('../utils/getPrettierConfig')

module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': [
    `prettier --config ${prettierConfig} --write`,
    'eslint'
  ]
}
