module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': process.env.ESLINT_FIX ? 'eslint --fix' : 'eslint'
}
