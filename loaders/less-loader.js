let less = require('less');
function loader(source){
  let css;
  console.log(less.render)
  less.render(source,function(err,r){
    console.log(err,r);
    css = r.css;
  });
  return css;
}
module.exports = loader;

// css-loader 来处理背景图