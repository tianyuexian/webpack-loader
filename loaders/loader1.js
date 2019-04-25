function loader(source) {
  console.log('loader1 ~~~')
  return source;
}
loader.pitch = function () {
  console.log('pitch1')
}
module.exports = loader;

// string or buffer
// 最终的loader 一般返回一个js脚本
// 并且这个最终的结果会放到eval中