var util = require('gulp-util');
var getFiles = require('get-files-in-dir');
var fecs = require('fecs');
var async = require('async');
var config = require('./config');

var extend = function (a, b) {
    var i;
    for (i in b) {
        if (b.hasOwnProperty(i)) {
            a[i] = b[i];
        }
    }
    return a;
};

/**
 * @note    对src下source文件进行自动format
 * @author  Xaber
 */
var format = function (callback) {
    var defaultOption = fecs.getOptions();

    var endsWithFileType = function (filename) {
        var fileType = filename.slice(filename.lastIndexOf('.') + 1);
        return config.dirFileFilter.some(function (type) {
            return fileType === type;
        });
    };

    // 获取目录下所有文件名称
    var files = config.dirs.reduce(function (memo, dir) {
        var f = getFiles(dir, true, endsWithFileType);
        return memo.concat(f);
    }, []);

    async.eachSeries(files, function (file, next) {
        // 进行格式化
        fecs.format(extend(extend({}, defaultOption), {
            _: [
                file
            ],
            type: config.fecsFormatTypes.join(','),
            command: 'format',
            replace: true
        }), function () {
            util.log(util.colors.yellow('[fecs] format ' + file) + ' success');
            next();
        });
    }, function () {
        util.log(util.colors.green('[fecs] format done!'));
        callback();
    });
};

module.exports = {
    format: format
};
