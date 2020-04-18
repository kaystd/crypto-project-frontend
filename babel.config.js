const presets = [
  '@babel/preset-env',
  '@babel/preset-react',
]
const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
]

module.exports = { presets, plugins }
