const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    host: 'localhost',
    port: 3000,
    overlay: {
      warnings: true,
      errors: true,
    },
    progress: true,
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
}
