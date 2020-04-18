const presets = [
  '@babel/preset-env',
  '@babel/preset-react',
  '@babel/preset-typescript',
]
const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
]

module.exports = { presets, plugins }
