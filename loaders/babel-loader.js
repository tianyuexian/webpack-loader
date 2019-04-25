// 转化js代码 @babel/core @babel/preset-env
let loaderUtils = require('loader-utils');
let babel = require('@babel/core');
// 获取我们当前的参数  
function loader(source) {
  // 通过loaderUtils 获取参数的参数
  let options = loaderUtils.getOptions(this);
  // 表示loader 异步处理
  let cb = this.async(); // 默认把执行loader完成的回调函数传给你自己，你自己告诉他什么时候解析完
  babel.transform(source, {
    ...options,
    sourceMap: true,
    filename: this.resourcePath.split('/').pop(), // 最终打包出结果的名字
  }, function (err, r) {
    // 参数第一个是错误 第二个是转化后的结果 第三个 转化后source-map
    cb(err, r.code, r.map); // tapable
  })
  return source;
}

module.exports = loader;