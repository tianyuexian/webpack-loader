function loader(source) {
  console.log('inline-loader')
  return source
}
module.exports = loader;


// expose-loader  require('expose-loader?$!jquery')