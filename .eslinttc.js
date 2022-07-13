module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
	  "endOfLine": "auto", //解决回车问题
  },
};