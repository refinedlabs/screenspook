/**
 * Module dependencies.
 */

var express = require('express'),
    cradle = require('cradle'),
    crypto  = require('crypto'),

    dbDesign = require('./dbDesign'),
    
    conn = new(cradle.Connection)();
    db = conn.database('screenspook'),
    dbActions = require('./dbActions').create(db),

    app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// init database.
db.save('_design/screenspook', dbDesign);
  
// upload a screenshot and check whether it is equal to the currently accepted.
app.post('/screenshot', function(req, res){
    var screenshotId = req.body.screenshotId,
        hash = crypto.createHash('SHA1');
        hash.update(req.body.encodedFile, 'utf8'),
        screenshotHash = hash.digest('hex'),
        screenshotKey = 'blob_' + screenshotHash;

    console.log('got screenshot with hash '+ screenshotKey + ' for screenshotId ' + screenshotId);

    /* ensure that the BLOB is contained in the db. */
    db.get(screenshotKey, function(err, doc) {
        if (err || !doc) {
            console.log('saving screenshot to database.');
            db.save(screenshotKey, {
                type : 'blob',
                encodedFile : req.body.encodedFile
            });
        } else {
            console.log('screenshot already in database.');
        }
    });

    // get currently accepted screenshot
    db.view('screenspook/accepted', { key : screenshotId }, function(err, doc) {
        if (!err && doc.length === 1 && doc[0].value.blob === screenshotKey) {
            console.log('currently accepted screenshot equals submitted screenshot');
            dbActions.deleteCurrentlyPendingFor(screenshotId, function(err, doc) {
                // TODO we do not store the blob again, but probably we want to audit this success.
                res.send({accepted:true});
            });
        } else {
            dbActions.deleteCurrentlyPendingFor(screenshotId, function(err, doc) {
                db.save({
                    type : 'shot',
                    date : new Date(),
                    screenshotId : screenshotId,
                    blob : screenshotKey,
                    status : 'pending'
                }, function(err, dbRes) {
                    if (err) {
                        console.log('error while saving screenshot: ' + err);
                        res.send(err);
                    } else {
                        res.send({accepted:false});
                    }
                });
            });
        }
    });
});

app.get('/accepted/:screenshotId', function(req, res) {
    console.log('get accepted for "' + req.params.screenshotId + '"');
    db.view('screenspook/accepted', { key : req.params.screenshotId }, function(err, doc) {
        if (err) {
            res.send(err);
        } else {
            if (doc.length === 1) {
                res.send(doc[0].value);
            }
        }
    });
});

// get the specified blob
app.get('/blob/:id', function(req, res) {
    db.get(req.params.id, function(err, dbRes) {
        if (err) {
            res.send(err);
        } else {
            decodedImage = new Buffer(dbRes.encodedFile, 'base64');
            res.write(decodedImage);
            res.end();
        }
    });
});

// accept a screenshot (all other screenshots for the screenshotId will be marked invalid).
app.get('/accept/:id', function(req, res) {
    db.get(req.params.id, function(err, dbRes) {
        if (err) {
            res.send(err);
        } else {
            screenshotId = dbRes.screenshotId;

            // get currently accepted screenshot
            db.view('screenspook/acceptedIds', { key : screenshotId }, function(err, doc) {
                if (!err) {
                    if (doc.length === 1) {
                        db.merge(doc[0].id, {status:'historic'}, function(err, dbRes) {
                            //res.send(err);
                        });
                    }
                }

                // set new screenshot accepted
                db.merge(req.params.id, {status:'accepted'}, function(err, dbRes) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send({ok:true});
                    }
                });
            });
        }
    });
});

app.get('/overview', function(req, res) {
    db.view('screenspook/accepted', function(err, acceptedShots) {
        db.view('screenspook/pending', function(err, pendingShots) {
            var mapValue = function(item) {
                return item;
            };

            var acceptedShotsValues = acceptedShots.map(mapValue);
            var pendingShotsValues = pendingShots.map(mapValue);

            res.send({
                acceptedShots : acceptedShotsValues,
                pendingShots  : pendingShotsValues
            });
        });
    });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
