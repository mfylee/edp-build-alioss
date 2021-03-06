## 使用方法

#### 引入处理器
```
var AliOss = require('edp-build-alioss');
```

#### 实例化处理器
```
var alioss = new AliOss({
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
    region: 'oss-cn-hangzhou-internal'
});
```

#### 阿里云配置

在用户`HOME`目录或者当前目录添加配置文件`.aliyun`

##### 内容参考(yaml)
```
ak: xxxx
sk: xxxxx
```

#### 加入到处理器列表中

一般情况下上传文件是在编译的最后环节，所以将alioss加入到队列的最后面

##### 只有在环境变量NODE_ENV为prod或production的情况下才有用
