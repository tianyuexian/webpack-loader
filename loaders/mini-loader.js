class MiniCssExtractPlugin{
  constructor({filename}){
    this.filename = filename;
  }
  apply(compiler){
    compiler.hooks.emit.tap('MiniCssExtractPlugin',function (compilation) {
      compilation.assets[this.filename] = {
        source(){

        },
        size(){
        }
      }
    })
  }
}
MiniCssExtractPlugin.loader = function(source){

}

module.exports = MiniCssExtractPlugin
// MiniCssExtractPlugin.loader
//new MiniCssExtractPlugin
// plugin里面做的  this.assets['xxx.css']


// 视频列表 