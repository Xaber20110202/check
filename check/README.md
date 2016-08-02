# 规范与检测

## 基础代码规范

基于百度 [fecs](http://fecs.baidu.com/) 工具，针对代码格式规范进行格式化与检测。

### 格式化

集成在 `gulpfile.js` 中，已经通过 `fecs format` 操作，在代码打包合并压缩时，将 src 目录下的 js 做了最基本的格式修正。

因为 less 的 `format` 存在问题，less 只进行 `check` 处理。

### 检测结果

基础代码规范的检测处理也已集成在 `gulpfile.js` 中，在格式化之后，仅在每日第一次打包时候运行，文件名按照日期，命名生成到 `standard-check` 目录下。（功能暂未开放）

大家可以通过命令行运行 `node ./check/standard-check-run.js` 进行检测结果输出

## 进阶代码规范（基于代码问题）

TODO. 检测代码的复杂度、耦合性。大家可以清晰得认识到自己的代码有什么问题