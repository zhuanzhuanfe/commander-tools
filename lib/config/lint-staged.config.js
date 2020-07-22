const eslintConfig = require('../utils/getEslintConfig')
const prettierConfig = require('../utils/getPrettierConfig')
const fix = process.env.ESLINT_FIX === 'fix'

module.exports = fix
  ? {
      'src/**/*.{js,jsx,ts,tsx}': [
        `prettier --config ${prettierConfig} --write`,
        `eslint --config ${eslintConfig} --fix`
      ]
    }
  : {
      'src/**/*.{js,jsx,ts,tsx}': [
        `eslint --config ${eslintConfig}`
      ]
    }
