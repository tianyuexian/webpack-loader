let loaderUtils = require('loader-utils');
function loader(source) { // loader的参数默认是字符串个数
  // 先生成一个md5的路径 产生一个名字
  // 用文件内容产生一个hash戳 并且扩展名用原来解析文件的名字
  console.log(source)
  let filename = loaderUtils.interpolateName(this, '[hash].[ext]', { content: source })
  this.emitFile(filename, source);
  return `module.exports=${JSON.stringify(filename)}`
}
loader.raw = true; // 使用二进制
module.exports = loader;