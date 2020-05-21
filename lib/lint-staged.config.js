var cmd = process.env.ESLINT_FIX ? 'eslint --fix' : 'eslint'

module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': cmd
}
