module.exports = {
  ecmaFeatures: {
    jsx: false,
  },
  env: {
    browser: true,
    es6: true,
    greasemonkey: true,
    jquery: true,
  },
  extends: ['standard'],
  plugins: [],
  rules: {
    'max-len': ['error', 100]
  },
  settings: []
}
