const postcss = require('rollup-plugin-postcss');

module.exports = {
  rollup(config, options) {
    config.plugins = [postcss(), ...config.plugins];
    return config;
  },
};
