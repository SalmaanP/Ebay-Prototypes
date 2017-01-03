/**
 * Created by Salmaan on 10/27/2016.
 */

var ads = require('../models/ads');

function handle_request(msg, callback) {

    console.log('in get recent ads service handle request');

    ads
        .find({sold_out: {$eq:0}})
        .sort('-date_added')
        .populate('seller')
        .exec(function (err, ad) {
            if (!err) {
                callback(null, ad);
            } else {
                callback(err, null);
            }
        });



}

exports.handle_request = handle_request;