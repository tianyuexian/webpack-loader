let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'loaders')]
  },
  module: {
    rules: [
      {
        test: /\.png$/,
        use:{
          loader: 'url-loader',
          options:{
            limit:200*1024
          }
        }
      },
      {
        test: /\.js/,
        // webpack.bannerPlugin 
        use: {
          loader: 'banner-loader',
          options: {
            text: '珠峰架构',
            filename: path.resolve(__dirname, 'banner.txt')
          }
        }
      },
      {
        test:/\.less$/,
        use:[mini-loader.loader,'less-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}