/**
 * 基于edp编译平台，适配Ali OSS存储服务
 *
 * 只有在环境变量`NODE_ENV`为`prod`的情况下才有用
 *
 * @author mfylee@me.com
 * @since 2016-05-05
 */
var os = require('os');
var fs = require('fs');
var path = require('path');

var OSS = require('ali-oss');
var co = require('co');

var cfg = require("config-file-loader");
var aliyunConfig = new cfg.Loader().get("aliyun");

function extend(dist, src) {
    for (var i in src) {
        if (src.hasOwnProperty(i)) {
            dist[i] = src[i];
        }
    }
}

function AliOss(options) {
    extend(this, this.constructor.DEFAULT_OPTIONS);
    extend(this, options);
    if (process.env.NODE_ENV === 'prod') {
        this.client = new OSS({
            region: this.region,
            accessKeyId: this.ak || aliyunConfig.ak,
            accessKeySecret: this.sk || aliyunConfig.sk
        });

        this.client.useBucket(this.bucket);
    }
}

AliOss.DEFAULT_OPTIONS = {
    name: 'AliOss',
    parallel: os.cpus().length,
    files: [
        '*.js', '*.css', '*.html',
        '*.eot', '*.svg', '*.ttf', '*.woff',
        '*.png', '*.jpg', '*.gif', '*.jpeg', '*.bmp', '*.swf'
    ],
    // 访问授权码
    ak: '',
    sk: '',
    // bucket名称
    bucket: '',
    // 存储到OSS的哪一个目录下面
    prefix: '',
    // bucket所在的区域，如果是在阿里云机器上，可以使用内部region，节省流量
    region: 'oss-cn-hangzhou',
};
/**
 * 上传文件到Bucket
 * @param {string} name
 * @param {string} data
 * @param {function} callback
 */
AliOss.prototype.upload = function (name, data, callback) {
    var me = this;
    co(function* () {
        var result = yield me.client.put(name, new Buffer(data));
        callback();
    }).catch(function (err) {
        callback(err);
    });
};

AliOss.prototype.process = function (file, processContext, callback) {
    var me = this;
    if (process.env.NODE_ENV !== 'prod' || !file.outputPath) {
        callback();
        return;
    }

    var objectName = path.join(me.prefix, file.outputPath);
    me.upload(objectName, file.data, function (error) {
        if (error) {
            // retry
            console.log('retry upload for:' + objectName);
            me.upload(objectName, file.data, function (err) {
                if (err) {
                    console.log('upload file error: ' + objectName);
                    // 如果出现上传失败，则强制退出，不能继续执行
                    process.exit(1);
                }
                else {
                    callback();
                }
            });
        }
        else {
            callback();
        }
    });
};

module.exports = exports = AliOss;
