import {
    version
} from '../../package.json';
import {
    Router
} from 'express';
import facets from './facets';

export default ({
    config,
    db
}) => {
    let api = Router();

    // mount the facets resource
    api.use('/elk', (req, res) => {
        const elasticsearch = require('elasticsearch');
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
                if (results.hits.total > 0) console.log(`returned article titles:`);
                results.hits.hits.forEach((hit, index) => console.log(`\t${++index} - ${hit._source.remote_addr} (score: ${hit._score})`));
                console.log(JSON.stringify(results, null, 4));
                console.log(`aggregations values.`);

                var jsonResult = new Array();
                results.aggregations.result_agg.buckets.forEach((hit, index) => {

                    console.log(`\t${++index} - ${hit.key} - ${hit.doc_count} `);
                    let jsonResultItem = new Object();
                    //jsonResultItem.index = index
                    jsonResultItem.key = hit.key
                    jsonResultItem.doc_count = hit.doc_count
                    jsonResultItem.data = new Array();

                    hit.methodCount.buckets.forEach((hit, index)=>{
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

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({
            version
        });
    });

    return api;
}