ScreenSpook
========
ScreenSpook is a showcase application that demonstrates how screenshot-based regression testing can be implemented
using [CasperJS](http://casperjs.org) and [PhantomJS](http://phantomjs.org).

What's it about?
---
Taking screenshots at relevant steps during navigation actions through a webapp and sending them to the ScreenSpook
server, which will respond whether the screenshot of the same interaction has been manually accepted before. The ScreenSpook server comes with
a web interface allowing the user to approve new screenshots.

Prerequisites
----

* PhantomJS
* CasperJS

Components
---
The showcase consists of the following components:

* A CasperJS module that supplies the method verifyScreenshot(screenshotId[, area]) (the area parameter is passed to [casper.captureBase64](http://casperjs.org/api.html#casper.captureBase64))
* An example application (a copy of [Localtodos](http://localtodos.com))
* A node.js server

Deploying and running the showcase
-----

* Make sure CasperJS is working, which involves installing [PhantomJS](http://phantomjs.org)
* Install [node.js](http://nodejs.org) and [CouchDB](http://couchdb.apache.org)
* run `curl -X PUT http://localhost:5984/screenspook` to create a ScreenSpook database
* run `cd example-app-todos && npm install && node app.js` to download required NPM modules and run the server with the example app (runs at http://localhost:8080)
* run `cd server && npm install && node app.js` to download required NPM modules and run the ScreenSpook server
* open http://localhost:3000 to see the screenspook site
* run `cd casperjs && casperjs example-todos.js` to see the first tests fail



http://googletesting.blogspot.de/2011/10/unleash-qualitybots.html
http://sikuli.org/
http://code.google.com/p/fighting-layout-bugs/