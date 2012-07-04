module.exports = {

    create : function(db) {

        return {
            deleteCurrentlyPendingFor : function(screenshotId, callback) {
                db.view('screenspook/pending2', { key : screenshotId }, function(err, doc) {
                    if (!err && doc.length === 1) {
                        // delete current pending request for this id.
                        console.log('deleting current screenshot ' + doc[0].value._id + ' for id ' + screenshotId + ' (was current pending request)');
                        db.remove(doc[0].value._id, doc[0].value._rev, callback);
                    } else {
                        callback(err, doc);
                    }
                });
            }
        }
    }

};
