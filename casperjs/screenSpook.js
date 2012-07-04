var fs = require('fs'),
    servicePage = require('./servicePage'),
    webpage = require('webpage');

exports.create = function (serverUrl) {

    var service = servicePage.create({
            url:serverUrl
        }),

        verifyBase64 = function (encoded, screenshotId) {
            service.request({
                method:'POST',
                url:serverUrl + '/screenshot',
                body:JSON.stringify({
                    screenshotId:screenshotId,
                    encodedFile:encoded
                })
            }, function (result) {
                if (!result || result.trim().length === 0) {
                    casper.test.fail("ScreenSpook server did not return a result (not running?).");
                } else {
                    var parsedResult = JSON.parse(result);

                    if (parsedResult.accepted) {
                        casper.test.pass('screenshot "' + screenshotId + '" was accepted by server', 'INFO');
                    } else {
                        casper.test.fail('screenshot "' + screenshotId + '" was rejected.');
                    }
                }
            });
        };

    return {

        assertScreenshotAccepted:function (name, area) {
            var encoded = casper.captureBase64('png', area);
            verifyBase64(encoded, name);
        }

    };
};
