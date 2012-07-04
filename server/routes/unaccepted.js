
/*
 * GET home page.
 */

exports.pending = function(req, res){


    db.view('screenspook/accepted', function(err, doc) {
        res.render('pending', { title: 'ScreenSpookUA' })
        //res.send(doc);
    });	




};
