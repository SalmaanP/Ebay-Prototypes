/**
 * Created by Salmaan on 11/6/2016.
 */

var ads = require('../models/ads');

function handle_request(msg, callback) {

    console.log('in search service handle request');
    res = {};

    var search_string = msg.search_string;

    ads.find({name: new RegExp('^'+search_string+'$', "i")}, function(err, results) {

        if(!err){
            res.code = 200;
            res.ads = results;
            callback(null, res);
        } else {
            console.log(err);
            callback(err, null);
        }
    });

}

exports.handle_request = handle_request;