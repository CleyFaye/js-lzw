const eslintConfig = require("@cley_faye/eslint-config");
const config = eslintConfig({typescript: "./tsconfig.json"});
config.overrides.push({
  files: ["src/tests/**/*.test.ts"],
  env: {mocha: true},
});
module.exports = config;
