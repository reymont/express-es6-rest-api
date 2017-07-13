#日志

##最耗时的API

###api
```shell
curl -XGET http://127.0.0.1:8080/api/v1/elk/cost
```

###输入参数
| 名称          | 含义          | 示例   |备注|
| ------------ |:-------------:| -----: |--:|
|**start**     | 起始时间，时间戳，单位秒 | 1499657230262 |2017-7-10 11:27:10。如果不填，默认为当前时间前7天|
|**end**       | 结束时间，时间戳，单位秒 | 1499911490933 |2017-7-13 10:04:50。如果不填，默认为当前时间|
|**serverName**|请求域名|k8s.cloudos.yihecloud.com||
|**apiPrefix** | URI请求前缀      |   /api/v1  |除了域名之外的URI|

###输出结果
```json
[
    {
    "key": "/deploy/api/v1/engine/cluster/deploy/list", //访问链接
    "doc_count": 10492,                                 //访问次数
    "value": 91.54700155369937                          //访问耗时
    }
    ...
]
```

![][1]
[1]: http://latex.codecogs.com/gif.latex?\prod%20\(n_{i}\)+1

###完整示例
[http://127.0.0.1:8080/api/v1/elk/cost?start=1499657230262&end=1499911490933&apiPrefix=/api/v1&serverName=k8s.cloudos.yihecloud.com](http://127.0.0.1:8080/api/v1/elk/cost?start=1499657230262&end=1499911490933&apiPrefix=/api/v1&serverName=k8s.cloudos.yihecloud.com)

##成功/失败/认证失败率

###api
```shell
curl -XGET http://127.0.0.1:8080/api/v1/elk/cost
```

###输入参数
| 名称          | 含义          | 示例   |备注|
| ------------ |:-------------:| -----: |--:|
|**start**     | 起始时间，时间戳，单位秒 | 1499657230262 |2017-7-10 11:27:10。如果不填，默认为当前时间前7天|
|**end**       | 结束时间，时间戳，单位秒 | 1499911490933 |2017-7-13 10:04:50。如果不填，默认为当前时间|
|**serverName**|请求域名|k8s.cloudos.yihecloud.com||
|**apiPrefix** | URI请求前缀      |   /api/v1  |除了域名之外的URI|

###输出结果
```json
[
    {
    "key": "/deploy/api/v1/engine/cluster/deploy/list", //访问链接
    "doc_count": 10492,                                 //访问次数
    "value": 91.54700155369937                          //访问耗时
    }
    ...
]
```

![][1]
[1]: http://latex.codecogs.com/gif.latex?\prod%20\(n_{i}\)+1

###完整示例
[http://127.0.0.1:8080/api/v1/elk/cost?start=1499657230262&end=1499911490933&apiPrefix=/api/v1&serverName=k8s.cloudos.yihecloud.com](http://127.0.0.1:8080/api/v1/elk/cost?start=1499657230262&end=1499911490933&apiPrefix=/api/v1&serverName=k8s.cloudos.yihecloud.com)