let loaderUtils = require('loader-utils');
let mime = require('mime');
function loader(source) {
  let {limit} =  loaderUtils.getOptions(this);
  if(limit && limit> source.length){
    // base64要求有前缀 toString方法 可以把结果转化成字符串
    return `module.exports = "data:${mime.getType(this.resourcePath)};base64,${source.toString('base64')}"`
  }else{
    //return  module.exports=xxxx.png
    return require('./file-loader').call(this, source)
  }
}
loader.raw = true;
module.exports = loader;
//style-loader css-loader(@import  background:url("xxx")) 
//less-loader
//MiniCssExtractPlugin + html-webpack-plugin