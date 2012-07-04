// This is the design document for our CouchDB database. We install this on the DB server when the
// application is started.

module.exports = {

    // Query accepted screenshots.
    accepted: {
        map: function (doc) {
            if (doc.type == 'shot' && doc.status== 'accepted') {
                emit(doc.screenshotId, doc);
            }
        }
    },

    // Query only the IDs of accepted screenshots.
    acceptedIds: {
        map: function (doc) {
            if (doc.status=='accepted') {
                emit(doc.screenshotId, doc._id);
            }
        }
    },

    // Query pending screenshots.
    pending: {
        map: function (doc) {
            if (doc.status === 'pending') {
                emit(doc.screenshotId, doc);
            }
        }
    },

    // Query pending screenshots, but only their id and current revision.
    pending2: {
        map: function (doc) {
            if (doc.status === 'pending') {
                emit(doc.screenshotId, { _id: doc._id, _rev : doc._rev });
            }
        }
    }

};
