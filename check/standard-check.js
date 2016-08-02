var ejs = require('ejs');
var fecs = require('fecs');
var fs = require('fs');
var util = require('gulp-util');
var config = require('./config');

var forEachObj = function (obj, func) {
    var i;
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            func(obj[i], i);
        }
    }
};

var extend = function(a, b) {
    forEachObj(b, function (v, k) {
        a[k] = v;
    })
    return a;
};

var toDouble = function (num) {
    return num < 10 ? '0' + num : num;
};

var isType = function (filename, type) {
    var fileType = filename.slice(filename.lastIndexOf('.') + 1);
    return fileType === type;
};

// 当文件夹存在时进行下一步；不存在时，创建文件夹后进行下一步
var whenDirExists = function (dirPath, callback) {
    fs.exists(dirPath, function (exists) {
        if (exists) {
            callback();
        } else {
            fs.mkdir(dirPath, function (err, result) {
                callback();
            });
        }
    });
};

var check = function (dirs, callback) {
    fecs.check(extend(extend({}, fecs.getOptions()), {
        _: dirs,
        type: config.fecsCheckTypes.join(','),
        command: 'check',
        silent: true
    }), function(success, items) {
        callback({
            success: success,
            items: items
        });
    });
};

/**
 * @note    对src下source文件进行check并生成对应的检测结果
 * @author  Xaber
 */
var checkToDest = function (callback) {
    check(config.dirs, function(result) {
        fs.readFile(config.tmplPath, 'utf8', function (err, tmpl) {
            var oDate = new Date();
            var year = oDate.getFullYear();
            var month = oDate.getMonth() + 1;
            var date = oDate.getDate();
            var stacks = {};
            var items = result.items;

            // 获取js、less具体相关规则的不规范数量
            var getTypeStack = function (type) {
                var stack = {};
                var errorNum = 0;

                items.forEach(function (item) {
                    if (isType(item.path, type)) {
                        item.errors.forEach(function (error) {
                            errorNum += 1;
                            stack[error.rule] = stack[error.rule] ? (stack[error.rule] + 1) : 1;
                        });
                    }
                });

                return {
                    stack: stack,
                    num: errorNum
                };
            };

            var errorNum = items.reduce(function (memo, item) {
                return memo + item.errors.length;
            }, 0);

            var dirPath = config.checkDestPath + '/' + year + '-' + toDouble(month) + '/';
            var filePath = dirPath + date + '.html';

            ['js', 'less'].forEach(function (type) {
                stacks[type] = getTypeStack(type);
            });

            // 异步回调真是狗带
            var createFile = function (filePath) {
                fs.exists(filePath, function (exists) {
                    if (!exists) {
                        fs.writeFile(filePath, ejs.render(tmpl, {
                            items: items,
                            errorNum: errorNum,
                            stacks: stacks,
                            date: year + '-' + toDouble(month) + '-' + date
                        }), function (err, result) {
                            util.log(util.colors.green('[fecs] check dest ' + filePath) + ' done!');
                            if (callback) {
                                callback();
                            }
                        });
                    }
                });
            };
            
            whenDirExists(config.checkDestPath, function () {
                whenDirExists(dirPath, function () {
                    createFile(filePath);
                });
            });

        });
    });
};

module.exports = {
    check: check,
    checkToDest: checkToDest
};