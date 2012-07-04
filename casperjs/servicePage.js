var webpage = require('webpage');

/*
 Creates a new WebPage object which hosts XHR calls to an HTTP service.
 */
exports.create = function (config) {

    var servicePage = null,

        getServicePageInstance = function (callback) {
            if (servicePage === null) {
                servicePage = webpage.create();
                servicePage.open(config.url, function (status) {
                    callback(servicePage);
                });
            } else {
                callback(servicePage);
            }
        },

        getServicePageResult = function () {
            return servicePage.evaluate(function () {
                return window.__spook_result;
            });
        },

        createServicePageRequester = function () {
            return function () {
                if (window.spookInProgress) {
                    throw("a servicePage can only have 1 running request.");
                }

                var requestConf = window.requestConfig;

                var xmlHttp = new XMLHttpRequest();
                window.spookProcessed = false;
                window.spookInProgress = true;
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4) {
                        window.spookProcessed = true;
                        window.spookInProgress = false;
                        window.__spook_result = xmlHttp.responseText;
                    }
                };

                xmlHttp.open(requestConf.method, requestConf.url, true);
                xmlHttp.setRequestHeader('Content-Type', 'application/json');
                xmlHttp.send(requestConf.body || null);
            }
        },

        performServiceRequest = function (requestConfig, resultCallback) {

            getServicePageInstance(function (servicePage) {
                var sc = require('casper').create({
                    verbose:true,
                    logLevel:"debug",
                    page:servicePage
                });

                sc.page = servicePage;
                sc.evaluate(function (test) {
                    window.requestConfig = test;
                }, { test:requestConfig });
                servicePage.evaluate(createServicePageRequester());
            });

            casper.waitFor(function () {
                if (servicePage === null) {
                    return false;
                }

                return servicePage.evaluate(function () {
                    return window.spookProcessed;
                });
            });

            casper.then(function () {
                var result = getServicePageResult();

                var testObjFromPage = servicePage.evaluate(function () {
                    return window.testObj;
                });

                resultCallback(result);
            });

        };

    return {

        request:function (requestConfig, resultCallback) {
            performServiceRequest(requestConfig, resultCallback);
        }

    };

};

