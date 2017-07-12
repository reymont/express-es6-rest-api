import version from '../../package.json';
import Router from 'express';
import elasticsearch from 'elasticsearch';
import moment from 'moment';

const getStart = (start) => start || moment().subtract(7, 'days').valueOf();
const getEnd = (end) => end || moment().endOf('day').valueOf();

const esClient = new elasticsearch.Client({
    host: '192.168.31.215:9200',
    log: 'error'
});

const search = function search(index, body) {
    return esClient.search({
        index: index,
        body: body
    });
};

export default ({
    config
}) => {
    let api = Router();

    // 最耗时
    api.use('/elk/cost', (req, res) => {

        let body = {
            "_source":["@timestamp","uri","request_time"],
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "from": getStart(req.query.start),
                                "to": getEnd(req.query.end),
                                "include_lower": true,
                                "include_upper": true
                            }
                        }
                    }]
                }
            },
            "aggs": {
                "result_agg": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "day",
                        "min_doc_count": 0,
                        "extended_bounds": {
                            "min": getStart(req.query.start),
                            "max": getEnd(req.query.end)
                        }
                    },
                    "aggs": {
                        "methodCount": {
                            "terms": {
                                "field": "uri.keyword",
                                "size": 7,
                                "order": [{
                                        "_count": "desc"
                                    },
                                    {
                                        "_term": "asc"
                                    }
                                ]
                            },
                            "aggregations": {
                                "sum_request_time": {
                                    "sum": {
                                        "field": "request_time"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        search('logstash-*', body).then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (config.debug) {
                    console.log(JSON.stringify(results, null, 4));
                }

                console.log(`aggregations values.`);

                var jsonResult = new Array();
                results.aggregations.result_agg.buckets.forEach((hit, index = index++) => {
                    let data = new Array();
                    hit.methodCount.buckets.forEach((hit, index = index++) => {
                        data[index] = {
                            key: hit.key,
                            doc_count: hit.doc_count,
                            value: hit.sum_request_time.value
                        }
                    });
                    jsonResult[index] = {
                        key: hit.key,
                        doc_count: hit.doc_count,
                        data: data
                    }
                    console.log(JSON.stringify(jsonResult[index]));
                });
                console.log(new Date().getTime())
                res.json({
                    data: jsonResult
                });
            })
            .catch(console.error);

    });

    //调用次数
    api.use('/elk/count', (req, res) => {

        let body = {
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "from": getStart(req.query.start),
                                "to": getEnd(req.query.end),
                                "include_lower": true,
                                "include_upper": true
                            }
                        }
                    }]
                }
            },
            "aggs": {
                "methodCount": {
                    "terms": {
                        "field": "uri.keyword",
                        "size": 7,
                        "order": [{
                                "_count": "desc"
                            },
                            {
                                "_term": "asc"
                            }
                        ]
                    },
                    "aggregations": {
                        "sum_request_time": {
                            "sum": {
                                "field": "request_time"
                            }
                        }
                    }
                }
            }
        };

        search('logstash-*', body).then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (config.debug) {
                    console.log(JSON.stringify(results, null, 4));
                }
                console.log(`aggregations values.`);
                var jsonResult = new Array();
                results.aggregations.methodCount.buckets.forEach((hit, index = index++) => {
                    jsonResult[index] = {
                        key: hit.key,
                        doc_count: hit.doc_count
                    }
                    console.log(JSON.stringify(jsonResult[index]));
                });
                console.log(new Date().getTime())
                res.json({
                    data: jsonResult
                });
            })
            .catch(console.error);

    });

    //调用状态：200/400等
    api.use('/elk/status', (req, res) => {

        let body = {
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "from": getStart(req.query.start),
                                "to": getEnd(req.query.end),
                                "include_lower": true,
                                "include_upper": true
                            }
                        }
                    }]
                }
            },
            "aggs": {
                "range_status": {
                    "range": {
                        "field": "status",
                        "ranges": [{
                                "key": "success",
                                "from": 200.0,
                                "to": 300.0
                            },
                            {
                                "key": "400",
                                "from": 400.0,
                                "to": 401.0
                            },
                            {
                                "key": "401",
                                "from": 401.0,
                                "to": 402.0
                            },
                            {
                                "key": "402",
                                "from": 402.0,
                                "to": 403.0
                            },
                            {
                                "key": "404",
                                "from": 404.0,
                                "to": 405.0
                            },
                            {
                                "key": "500",
                                "from": 500.0,
                                "to": 1000.0
                            },
                            {
                                "key": "all",
                                "from": 100.0,
                                "to": 1000.0
                            }
                        ],
                        "keyed": false
                    },
                    "aggregations": {
                        "avg_request_time": {
                            "avg": {
                                "field": "request_time"
                            }
                        },
                        "max_request_time": {
                            "max": {
                                "field": "request_time"
                            }
                        },
                        "min_request_time": {
                            "min": {
                                "field": "request_time"
                            }
                        }
                    }
                }

            }
        };

        search('logstash-*', body).then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (config.debug) {
                    console.log(JSON.stringify(results, null, 4));
                }

                console.log(`aggregations values.`);

                var jsonResult = new Array();
                results.aggregations.range_status.buckets.forEach((hit, index = index++) => {
                    jsonResult[index] = {
                        key: hit.key,
                        doc_count: hit.doc_count
                    }
                    console.log(JSON.stringify(jsonResult[index]));
                });
                console.log(new Date().getTime())
                res.json({
                    data: jsonResult
                });
            })
            .catch(console.error);

    });

    //调用次数
    api.use('/elk/response', (req, res) => {
        let body = {
            "query": {
                "bool": {
                    "filter": [
                        {
                        "range": {
                            "@timestamp": {
                                "from": getStart(req.query.start),
                                "to": getEnd(req.query.end),
                                "include_lower": true,
                                "include_upper": true
                            }
                        }}
                    ]
                }
            },
            "aggs": {
                "methodResponse": {
                    "terms": {
                        "field": "uri.keyword",
                        "order": {
                            "sum_response_time": "desc"
                        }
                    },
                    "aggregations": {
                        "sum_response_time": {
                            "sum": {
                                "field": "upstream_response_time"
                            }
                        }
                    }
                }
            }
        };
        if(req.query.apiPrefix){body.query.bool.filter[1] = {"prefix":{"uri.keyword":req.query.apiPrefix}}}

        search('logstash-*', body).then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (config.debug) {
                    console.log(JSON.stringify(results, null, 4));
                }

                console.log(`aggregations values.`);

                var jsonResult = new Array();
                results.aggregations.methodResponse.buckets.forEach((hit, index = index++) => {
                    jsonResult[index] = {
                        key: hit.key,
                        doc_count: hit.doc_count,
                        sum_response_time: hit.sum_response_time.value
                    }
                    console.log(JSON.stringify(jsonResult[index]));
                });


                res.json({
                    data: jsonResult
                });
            })
            .catch(console.error);

    });

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({
            version
        });
    });

    return api;
}