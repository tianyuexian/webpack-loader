# 1.loader运行的总体流程
![image](https://github.com/tianyuexian/webpack-loader/blob/master/loader1.jpg)
# 2. loader配置
oader是导出为一个函数的node模块。该函数在loader转换资源的时候调用。给定的函数将调用loader API，并通过this上下文访问。
## 2.1 匹配(test)单个 loader
匹配(test)单个 loader，你可以简单通过在 rule 对象设置 path.resolve 指向这个本地文件
```
{
  test: /\.js$/
  use: [
    {
      loader: path.resolve('path/to/loader.js'),
      options: {/* ... */}
    }
  ]
}
```
## 2.2 匹配(test)多个 loaders
你可以使用 resolveLoader.modules 配置，webpack 将会从这些目录中搜索这些 loaders。
```
resolveLoader: {
   modules: [path.resolve('node_modules'), path.resolve(__dirname, 'src', 'loaders')]
},
```
### 2.1 3 npm link 
确保正在开发的本地 Npm 模块（也就是正在开发的 Loader）的 package.json 已经正确配置好； 在本地 Npm 模块根目录下执行 npm link，把本地模块注册到全局；
在项目根目录下执行 npm link loader-name，把第2步注册到全局的本地 Npm 模块链接到项目的 node_moduels 下，其中的 - loader-name 是指在第1步中的 package.json 文件中配置的模块名称。
```
npm link
```
### 2.1 4 alias
```
resolveLoader: {
        alias: {
            "babel-loader": resolve('./loaders/babel-loader.js'),
            "css-loader": resolve('./loaders/css-loader.js'),
            "style-loader": resolve('./loaders/style-loader.js'),
            "file-loader": resolve('./loaders/file-loader.js'),
            "url-loader": resolve('./loaders/url-loader.js')
        }
    },
```
# 3. API 
## 3.1 缓存结果
ebpack充分地利用缓存来提高编译效率
```
this.cacheable();
```
## 3.2 异步
当一个 Loader 无依赖，可异步的时候我想都应该让它不再阻塞地去异步
module.exports = function(source) {
    var callback = this.async();
    // 做异步的事
    doSomeAsyncOperation(content, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    });
};
## 3.3 raw loader 
默认的情况源文件是以 UTF-8 字符串的形式传入给 Loader,设置module.exports.raw = true可使用 buffer 的形式进行处理
```
module.exports.raw = true;
```
## 3.4 获得 Loader 的 options
```
const loaderUtils = require('loader-utils');
module.exports = function(source) {
  // 获取到用户给当前 Loader 传入的 options
  const options = loaderUtils.getOptions(this);
  return source;
};
```
## 3.5 返回其它结果
Loader有些场景下还需要返回除了内容之外的东西。
```
module.exports = function(source) {
  // 通过 this.callback 告诉 Webpack 返回的结果
  this.callback(null, source, sourceMaps);
  // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
  // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
  return;
};
```
完整格式
```
this.callback(
    // 当无法转换原内容时，给 Webpack 返回一个 Error
    err: Error | null,
    // 原内容转换后的内容
    content: string | Buffer,
    // 用于把转换后的内容得出原内容的 Source Map，方便调试
    sourceMap?: SourceMap,
    // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回，
    // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
    abstractSyntaxTree?: AST
);
```
## 3.6 同步与异步
Loader 有同步和异步之分，上面介绍的 Loader 都是同步的 Loader，因为它们的转换流程都是同步的，转换完成后再返回结果。 但在有些场景下转换的步骤只能是异步完成的，例如你需要通过网络请求才能得出结果，如果采用同步的方式网络请求就会阻塞整个构建，导致构建非常缓慢。
```
module.exports = function(source) {
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
    var callback = this.async();
    someAsyncOperation(source, function(err, result, sourceMaps, ast) {
        // 通过 callback 返回异步执行后的结果
        callback(err, result, sourceMaps, ast);
    });
};
```
## 3.7 处理二进制数据
在默认的情况下，Webpack 传给 Loader 的原内容都是 UTF-8 格式编码的字符串。 但有些场景下 Loader 不是处理文本文件，而是处理二进制文件，例如 file-loader，就需要 Webpack 给 Loader 传入二进制格式的数据。 为此，你需要这样编写 Loader：
```
module.exports = function(source) {
    // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的
    source instanceof Buffer === true;
    // Loader 返回的类型也可以是 Buffer 类型的
    // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果
    return source;
};
// 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据 
module.exports.raw = true;
```
## 3.8 缓存
在有些情况下，有些转换操作需要大量计算非常耗时，如果每次构建都重新执行重复的转换操作，构建将会变得非常缓慢。 为此，Webpack 会默认缓存所有 Loader 的处理结果，也就是说在需要被处理的文件或者其依赖的文件没有发生变化时， 是不会重新调用对应的 Loader 去执行转换操作的。
```
module.exports = function(source) {
  // 关闭该 Loader 的缓存功能
  this.cacheable(false);
  return source;
};
```
# 4.loader实战
loader-utils
schema-utils
this.async
this.cacheable
getOptions
validateOptions
addDependency
## 4.1 babel-loader
babel-core
babel-loader
babel-plugin-transform-react-jsx
this.request=/loaders/babel-loader.js!/src/index.js'
this.userRequest /src/index.js
this.rawRequest ./src/index.js
this.resourcePath /src/index.js
```
const babel=require('babel-core');
const path=require('path');

module.exports=function (source) {
    const options = {
        presets: ['env'],
        sourceMap: true,
        filename:this.request.split('/').pop()
    }
    let result=babel.transform(source,options);
    return this.callback(null,result.code,result.map);
}
```
## 4.2 BannerLoader
```
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');
function loader(source) {
    //把loader改为异步,任务完成后需要手工执行callback
    let cb = this.async();
    //启用loader缓存
    this.cacheable && this.cacheable();
    //用来验证options的合法性
    let schema = { 
        type: 'object',
        properties: {
            filename: {
                type: 'string'
            },
            text: {
                type: 'string'
            }
        }
    }
    //通过工具方法获取options
    let options = loaderUtils.getOptions(this);
    //用来验证options的合法性
    validateOptions(schema, options, 'Banner-Loader');
    let { text, filename } = options;
    if (text) {
        cb(null, text + source);
    } else if (filename) {
        fs.readFile(filename, 'utf8', (err, text) => {
            cb(err, text + source);
        });
    }
}

module.exports = loader;
```
## 4.3 pitch
    比如a!b!c!module, 正常调用顺序应该是c、b、a，但是真正调用顺序是 a(pitch)、b(pitch)、c(pitch)、c、b、a,如果其中任何一个pitching loader返回了     值就相当于在它以及它右边的loader已经执行完毕
    比如如果b返回了字符串"result b", 接下来只有a会被系统执行，且a的loader收到的参数是result b

    loader根据返回值可以分为两种，一种是返回js代码（一个module的代码，含有类似module.export语句）的loader，还有不能作为最左边loader的其他loader
    有时候我们想把两个第一种loader chain起来，比如style-loader!css-loader! 问题是css-loader的返回值是一串js代码，如果按正常方式写style-loader的参数就是一串代码字符串
    为了解决这种问题，我们需要在style-loader里执行require(css-loader!resouce)
    
pitch与loader本身方法的执行顺序图
```
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution
```
### 4.3.1 log-loader1.js
```
//source就是接收到的源文件的内容
let loader = function (source, sourceMaps, extra) {
    let cb = this.async();
    console.log('loader1');
    cb(null, source);
}
module.exports = loader;
loader.pitch = function (remainingRequest,previousRequest,data) {
    console.log('pitch1');
}
```
### 4.3.2 log-loader2.js
```
//source就是接收到的源文件的内容
let loader = function (source, sourceMaps, extra) {
    let cb = this.async();
    console.log('loader2');
    cb(null, source);
}

module.exports = loader;
loader.pitch = function (remainingRequest,previousRequest,data) {
    console.log('pitch2');
    return "2";
}
```
4.3.3 log-loader3.js
```
//source就是接收到的源文件的内容
const loaderUtils = require('loader-utils');
let loader = function (source) {
    let cb = this.async();
    console.log('loader3');
    cb(null, source);
}
module.exports = loader;
loader.pitch = function () {
    console.log('pitch3');
}
```
```
{
  test: /\.less$/,
  use:[path.resolve('src/loaders/log-loader1'),path.resolve('src/loaders/log-loader2'),path.resolve('src/loaders/log-loader3')]
}
```
## 4.4 css
### 4.4.1 less-loader.js
```
let less = require('less');
module.exports = function (source) {
    let callback = this.async();
    less.render(source, { filename: this.resource }, (err, output) => {
        this.callback(err, output.css);
    });
}
```
有些时间我们希望less-loader可以放在use数组最左边，最左边要求返回一个JS脚本
```
let less=require('less');
module.exports=function (source) {
  let callback = this.async();
    less.render(source,(err,output) => {
        callback(err, `module.exports = ${JSON.stringify(output.css)}`);
    });
}
```
### 4.4.2 style-loader
```
let loaderUtils=require("loader-utils");
 function loader(source) {
    let script=(`
      let style = document.createElement("style");
      style.innerHTML = ${JSON.stringify(source)};
      document.head.appendChild(style);
    `);
    return script;
} 
//pitch里的参数可不是文件内容，而是文件的请求路径
//pitch request就是你要加载的文件路径 //index.less
loader.pitch = function (request) {
    let style = `
    var style = document.createElement("style");
    style.innerHTML = require(${loaderUtils.stringifyRequest(this, "!!" + request)});
    document.head.appendChild(style);
 `;
    return style;
}
module.exports = loader;
```
### 4.4.3 css-loader.js
```
function loader(source) {
    let reg = /url\((.+?)\)/g;
    let current;
    let pos = 0;
    let arr = [`let lists = [];`];
    while (current = reg.exec(source)) {
        let [matchUrl, p] = current;
        let index = reg.lastIndex - matchUrl.length;
        arr.push(`lists.push(${JSON.stringify(source.slice(pos, index))})`);
        pos = reg.lastIndex;
        arr.push(`lists.push("url("+require(${p})+")")`);
    }
    arr.push(`lists.push(${JSON.stringify(source.slice(pos))})`);
    arr.push(`module.exports = lists.join('')`);
    return arr.join('\r\n');
}
module.exports = loader;
```
### 4.4.4 bundle.js
```
{
 "./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less":
/*!*************************************************************************!*\
  !*** ./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less ***!
  \*************************************************************************/
 (function(module, exports, __webpack_require__) {
eval("let lists = [];\r\nlists.push(\"div {\\n  color: red;\\n}\\nbody {\\n  background: \")\r\nlists.push(\"url(\"+__webpack_require__(/*! ./baidu.png */ \"./src/baidu.png\")+\")\")\r\nlists.push(\";\\n}\\n\")\r\nmodule.exports = lists.join('')\n\n//# sourceURL=webpack:///./src/index.less?./loaders/css-loader.js!./loaders/less-loader.js");

 }),
 "./src/baidu.png":
 (function(module, exports, __webpack_require__) {
eval("module.exports = __webpack_require__.p + \"b15c113aeddbeb606d938010b88cf8e6.png\";\n\n//# sourceURL=webpack:///./src/baidu.png?");
 }),
 "./src/index.js":
 (function(module, __webpack_exports__, __webpack_require__) {
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.less */ \"./src/index.less\");\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_0__);\n\n\n//# sourceURL=webpack:///./src/index.js?");
 }),
 "./src/index.less":
 (function(module, exports, __webpack_require__) {
eval("\n    var style = document.createElement(\"style\");\n    style.innerHTML = __webpack_require__(/*! !../loaders/css-loader.js!../loaders/less-loader.js!./index.less */ \"./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less\");\n    document.head.appendChild(style);\n \n\n//# sourceURL=webpack:///./src/index.less?");
 }
```
# 5.loader测试
## 5.1 安装依赖
```
cnpm install --save-dev jest babel-jest babel-preset-env
cnpm install --save-dev webpack memory-fs
```
## 5.2 src/loader.js
```
let {getOptions} = require('loader-utils');
function loader(source){
   const options = getOptions(this);
   source=source.replace(/\[name\]/g,options.name);
   return `module.exports = ${JSON.stringify(source)}`;
}
module.exports=loader;
```
## 5.3 test/example.txt
```
hello [name]
```
## 5.4 test/compile.js
```
const path=require('path');
const webpack=require('webpack');
let MemoryFs=require('memory-fs');
module.exports = function(fixture,options={}) {
    const compiler=webpack({
        mode:'development',
        context: __dirname,
        entry: `./${fixture}`,
        output: {
            path: path.resolve(__dirname),
            filename:'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.txt$/,
                    use: {
                        loader: path.resolve(__dirname,'../src/loader.js'),
                        options:{name:'Alice'}
                    }
                }
            ]
        }
    });
    compiler.outputFileSystem=new MemoryFs();
    return new Promise(function (resolve,reject) {
        compiler.run((err,stats) => {
            if (err) reject(err);
            else resolve(stats);
        });
    });
}
```
## 5.5 test/loader.test.js
```
let compile=require('./compile');
test('replace name',async () => {
    const stats=await compile('example.txt');
    const data=stats.toJson();
    const source=data.modules[0].source;
    expect(source).toBe(`module.exports = "hello Alice"`);
});
```
5.6 package.json
```
"scripts": {
  "test":"jest"
}
```
# 6. loader源码
loader是用来加载处理各种形式的资源,本质上是一个函数, 接受文件作为参数,返回转化后的结构。

    loader 用于对模块的源代码进行转换
    loader 可以使你在 import 或"加载"模块时预处理文件
## 6.1 NormalModuleFactory
    ! noAutoLoaders 所有的loader都不要执行
    !! noPrePostAutoLoaders 不要前后置loader
    -! noPreAutoLoaders 不要前置loader
```
this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
            const contextInfo = data.contextInfo;
            const context = data.context;
            const request = data.request;
            debugger /*resolve钩子上注册的方法较长，其中还包括了模块资源本身的路径解析。resolver有两种，分别是loaderResolver和normalResolver。*/
            const loaderResolver = this.getResolver("loader");
            const normalResolver = this.getResolver("normal", data.resolveOptions);
            //匹配的资源
            let matchResource = undefined;
            let requestWithoutMatchResource = request;//这是原始的请求
            const matchResourceMatch = MATCH_RESOURCE_REGEX.exec(request);//"^([^!]+)!=!"
            if (matchResourceMatch) {//如果能匹配上
                matchResource = matchResourceMatch[1];//取得匹配到的资源 
                if (/^\.\.?\//.test(matchResource)) {//如果是一个相对路径,则转成绝对路径
                    matchResource = path.join(context, matchResource);
                }//把匹配到的部分截取掉
                requestWithoutMatchResource = request.substr(
                    matchResourceMatch[0].length
                );
            }
            debugger /*noPreAuto指的是只用行内loader,禁用配置文件中的loader配置*/
            const noPreAutoLoaders = requestWithoutMatchResource.startsWith("-!");
            const noAutoLoaders =
                noPreAutoLoaders || requestWithoutMatchResource.startsWith("!");//!表示不走配置
            const noPrePostAutoLoaders = requestWithoutMatchResource.startsWith("!!");//表示禁用前后loader
            let elements = requestWithoutMatchResource
                .replace(/^-?!+/, "")//把-!替换成空
                .replace(/!!+/g, "!")//把!!替换成一个!
                .split("!"); debugger /*webpack会从request中解析出所需的loader,包括资源本身 */
            let resource = elements.pop();//取得资源
            elements = elements.map(identToLoaderRequest);//剩下的全转成loader对象

```
6.2 webpack/lib/NormalModule.js
```
runLoaders({
                resource: this.resource,
                loaders: this.loaders,
                context: loaderContext
},
(err, result) => {
const resourceBuffer = result.resourceBuffer;
const source = result.result[0];
const sourceMap = result.result.length >= 1 ? result.result[1] : null;
const extraInfo = result.result.length >= 2 ? result.result[2] : null;//ast
this._source = this.createSource(
                    this.binary ? asBuffer(source) : asString(source),
                    resourceBuffer,
                    sourceMap
);
this._ast = typeof extraInfo === "object" &&
                    extraInfo !== null &&
                    extraInfo.webpackAST !== undefined? extraInfo.webpackAST: null;
} 
```
## 6.3 LoaderRunner.js
loader-runner/lib/LoaderRunner.js
```
iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
callback(null, {
            result: result,//结果
            resourceBuffer: processOptions.resourceBuffer,
            cacheable: requestCacheable,
            fileDependencies: fileDependencies,
            contextDependencies: contextDependencies
});
}
```
## 6.4 LoaderRunner.js
```
if(loaderContext.loaderIndex >= loaderContext.loaders.length)
        return processResource(options, loaderContext, callback);
var fn = currentLoaderObject.pitch;

runSyncOrAsync(fn,loaderContext);

function runSyncOrAsync(fn, context, args, callback) {
    var isSync = true;
    var isDone = false;
    var isError = false; // internal error
    var reportedError = false;
    context.async = function async() {
        if (isDone) {
            if (reportedError) return; // ignore
            throw new Error("async(): The callback was already called.");
        }
        isSync = false;
        return innerCallback;
    };
    var innerCallback = context.callback = function () {
        if (isDone) {
            if (reportedError) return; // ignore
            throw new Error("callback(): The callback was already called.");
        }
        isDone = true;
        isSync = false;
        try {
            callback.apply(null, arguments);
        } catch (e) {
            isError = true;
            throw e;
        }
    };
    try {
        var result = (function LOADER_EXECUTION() {
            return fn.apply(context, args);
        }());
        if (isSync) {
            isDone = true;
            if (result === undefined)
                return callback();
            if (result && typeof result === "object" && typeof result.then === "function") {
                return result.catch(callback).then(function (r) {
                    callback(null, r);
                });
            }
            return callback(null, result);
        }
    } catch (e) {
        if (isError) throw e;
        if (isDone) {
            // loader is already "done", so we cannot use the callback function
            // for better debugging we print the error on the console
            if (typeof e === "object" && e.stack) console.error(e.stack);
            else console.error(e);
            return;
        }
        isDone = true;
        reportedError = true;
        callback(e);
    }

}
```
```
function runSyncOrAsync(fn, context, callback) {
    var isSync = true;
    context.callback = callback;
    context.async = function async() {
        isSync = false;
        return context.callback;
    };

    var result = fn.apply(context);
    if (isSync) {
        return callback(null, result);
    }
}

function say() {
    return this.name;
}
function say2() {
    let cb = this.async();
    cb(null);
}
let context = { name: 'zfpx' };
runSyncOrAsync(say2, context, function () {
    console.log('over');
});
```
#6.5 loadLoader.js:13
```
var module = require(loader.path);
loader.normal = typeof module === "function" ? module : module.default;
loader.pitch = module.pitch;
loader.raw = module.raw;
```
## 6.6 LoaderRunner.js
```
runSyncOrAsync(
            fn,
            loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
            function(err) {
                if(err) return callback(err);
                var args = Array.prototype.slice.call(arguments, 1);
                if(args.length > 0) {
                    loaderContext.loaderIndex--;
                    iterateNormalLoaders(options, loaderContext, args, callback);
                } else {
                    iteratePitchingLoaders(options, loaderContext, callback);
                }
            }
        );
```
