function loader(source) {
  console.log('loader2 ~~~')
  return source;
}
loader.pitch = function () {
  console.log('pitch2');

}
module.exports = loader;
