module.exports = {
  "root": true,
  "extends": "eslint:recommended",
  "env": {
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 10
  },
  "rules": {
    "semi": ["error", "never"],
    "quotes": ["error", "single"]
  }
}
