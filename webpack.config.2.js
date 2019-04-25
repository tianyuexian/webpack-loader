let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
// 加载loader的方式
// 1) 通过第三方模块
// 2) 写绝对路径来进行加载
// 3) resolveLoader alias modules
// 4) 通过npm link 链接以有的loader
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolveLoader:{
    modules: [
      path.resolve(__dirname,'node_modules'),
      path.resolve(__dirname, 'loaders')]
  },
  // devtool:'source-map',
  module: {
    rules: [
     {
       test:/\.js/,
       use:{
         loader: 'babel-loader',
         options:{
           presets:['@babel/preset-env'],
         }
       }
     }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}