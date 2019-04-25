// 1) 校验参数的正确性
// 2) 获取我们的参数
// 3) 转化代码 把结果导出

let loaderUtils = require('loader-utils');
let validateOptions = require('schema-utils');
let fs = require('fs');
function loader(source) {
  // this.cacheable(false) 不使用缓存
  let options = loaderUtils.getOptions(this);
  let schema = {
    type:'object',
    properties:{
      text:{
        type:'string'
      },
      filename:{
        type:'string'
      }
    }
  }
  // 文件改变默认不会重新编译 因为webpack不会将他作为依赖
  this.addDependency(options.filename);
  validateOptions(schema,options,'banner-loader');
  let cb = this.async();
  if(options.filename){ // 用文件
    fs.readFile(options.filename,'utf8',function (err,data) {
      cb(err, `/**${data}**/${source}`)
    })
  }else{
    cb(null, `/**${options.text}**/${source}`);
  }
}
module.exports = loader;


// file-loader 处理图片的