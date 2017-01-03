/**
 * Created by Salmaan on 10/27/2016.
 */

var ads = require('../models/ads');


function handle_request(msg, callback) {

    console.log('in get item service handle request');

    if(msg.item_id != undefined) {
        ads
            .findOne({_id: msg.item_id})
            .populate('seller')
            .exec(function (err, ad) {
                if (!err) {
                    callback(null, ad);
                    // console.log(ad);
                } else {
                    callback(err, null);
                }
            });
    } else {
        // console.log('ll');
        callback("Error", null);
    }

}

exports.handle_request = handle_request;