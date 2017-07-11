import version from '../../package.json';
import Router from 'express';
import elasticsearch from 'elasticsearch';
import moment from 'moment';

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
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "from": "1499483992610",
                                "to": "1499583992610",
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
                            "min": "1499483992610",
                            "max": "1499583992610"
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
                results.aggregations.result_agg.buckets.forEach((hit, index) => {

                    console.log(`\t${++index} - ${hit.key} - ${hit.doc_count} `);
                    let jsonResultItem = new Object();
                    //jsonResultItem.index = index
                    jsonResultItem.key = hit.key
                    jsonResultItem.doc_count = hit.doc_count
                    jsonResultItem.data = new Array();

                    hit.methodCount.buckets.forEach((hit, index) => {
                        let request = new Object();
                        request.key = hit.key
                        request.doc_count = hit.doc_count
                        request.value = hit.sum_request_time.value
                        jsonResultItem.data[index] = request;
                    });

                    jsonResult[index] = jsonResultItem
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
                                "from": "1499483992610",
                                "to": "1499583992610",
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
                results.aggregations.methodCount.buckets.forEach((hit, index) => {

                    console.log(`\t${++index} - ${hit.key} - ${hit.doc_count} `);
                    let jsonResultItem = new Object();
                    //jsonResultItem.index = index
                    jsonResultItem.key = hit.key
                    jsonResultItem.doc_count = hit.doc_count

                    jsonResult[index] = jsonResultItem
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
                                "from": "1499483992610",
                                "to": "1499583992610",
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
                results.aggregations.range_status.buckets.forEach((hit, index) => {

                    console.log(`\t${++index} - ${hit.key} - ${hit.doc_count} `);
                    let jsonResultItem = new Object();
                    //jsonResultItem.index = index
                    jsonResultItem.key = hit.key
                    jsonResultItem.doc_count = hit.doc_count

                    jsonResult[index] = jsonResultItem
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
        let start = req.query.start == null ? moment().subtract(7, 'days').valueOf() : req.query.start;
        let end = req.query.end == null ? moment().endOf('day').valueOf() : req.query.end;

        console.log("start = " + start)
        console.log("end = " + end)
        let body = {
            "query": {
                "bool": {
                    "filter": [{
                        "range": {
                            "@timestamp": {
                                "from": start,
                                "to": end,
                                "include_lower": true,
                                "include_upper": true
                            }
                        }
                    }]
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

        search('logstash-*', body).then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (config.debug) {
                    console.log(JSON.stringify(results, null, 4));
                }

                console.log(`aggregations values.`);

                var jsonResult = new Array();
                results.aggregations.methodResponse.buckets.forEach((hit, index) => {

                    console.log(`\t${++index} - ${hit.key} - ${hit.doc_count} `);
                    let jsonResultItem = new Object();
                    //jsonResultItem.index = index
                    jsonResultItem.key = hit.key
                    jsonResultItem.doc_count = hit.doc_count
                    jsonResultItem.sum_response_time = hit.sum_response_time.value

                    jsonResult[index] = jsonResultItem
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