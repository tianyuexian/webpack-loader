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
  // resolve:{ // 第三方模块加载方式
  //   modules:[],
  //   mainFiles:
  //   mainFileds,
  //   alias,
  //   extensions
  // },
  resolveLoader:{
    modules: [
      path.resolve(__dirname,'node_modules'),
      path.resolve(__dirname, 'loaders')]
    // alias:{
    //   loader1:path.resolve(__dirname, 'loaders', 'loader1.js')
    // }
  },
  // loader的加载顺序是从右向左 从下到上
  // loader的分类 pre + normal + inlineLoader + post
  // loader分为两个部分 pitch normal pitch正向执行 normalloader是反向执行 如果某个人pitchloader有返回值了 回跳过剩下的loader和自己的loader执行上一次loader


  // loader的特点 简单模块 loader可以链式调用 功能唯一 loader不能有状态

  // babel-loader @babel/core @babel/preset-env 
  // file-loader url-loader
  // style-loader css-loader less-loader minicssextractPlugin.loader
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: 'loader1',
        //enforce:'pre'
      },
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: 'loader2'
      },
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: 'loader3',
        //enforce:'post'
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}