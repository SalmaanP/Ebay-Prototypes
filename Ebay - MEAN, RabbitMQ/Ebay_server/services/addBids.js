/**
 * Created by Salmaan on 10/28/2016.
 */

var bids = require('../models/bids');

function handle_request(msg, callback) {

    console.log("in add bid service");

    var bid = new bids();

    var res = {};

    bid.ad_id = msg.bidObject.ad_id;
    bid.seller = msg.bidObject.seller;
    bid.buyer = msg.bidObject.buyer;
    bid.bid_price = msg.bidObject.bid_price;
    bid.base_price = msg.bidObject.base_price;
    bid.date = msg.bidObject.date;
    bid.item_name = msg.bidObject.item_name;
    bid.item_description = msg.bidObject.item_description;

    bid.save(function(err){
        if (!err) {
            res.code = 200;
            callback(null, res);
        } else {
            res.code = 500;
            console.log(err);
            callback(err, res);
        }
    });

}

exports.handle_request = handle_request;