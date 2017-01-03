/**
 * Created by Salmaan on 10/28/2016.
 */

var bids = require('../models/bids');

function handle_request(msg, callback) {

    console.log('in get Max bid service request');

    var res = {};
    var item_id = msg.item_id;

/*    bids
        .findOne({ ad_id: item_id })
        .sort(bid_price, -1)
        .exec( function(err, bid) {
            if(!err){
                res.code = 200;
                res.bid = bid;
                callback(null, res);
            } else {
                console.log(err);
                res.code = 500;
                callback(err, null);
            }
    });*/


    bids
        .findOne({ ad_id:item_id })
        .sort('-bid_price')
        .exec(function (err, bid) {

            if(!err){
                res.code = 200;
                res.bid = bid;
                callback(null, res);
            } else {
                console.log(err);
                res.code = 500;
                callback(err, null);
            }

        });


}

exports.handle_request = handle_request;