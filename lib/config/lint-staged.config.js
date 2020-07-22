const eslintConfig = require('../utils/getEslintConfig')
const prettierConfig = require('../utils/getPrettierConfig')
const fix = process.env.ESLINT_FIX

module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': [
    `prettier --config ${prettierConfig} --write`,
    `eslint --config ${eslintConfig} ${fix ? '--fix' : ''}`
  ]
}
