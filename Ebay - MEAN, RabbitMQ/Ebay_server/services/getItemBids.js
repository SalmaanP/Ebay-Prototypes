/**
 * Created by Salmaan on 10/28/2016.
 */

var bids = require('../models/bids');

function handle_request(msg, callback) {

    console.log('in get item bids service handle request');

    var item_id = msg.item_id;
    var res = {};
    // console.log(item_id);

    bids
        .find({ad_id:item_id})
        .sort('-date')
        .populate('ad_id')
        .populate('seller')
        .populate('buyer')
        .exec(function(err, result){
            if(err){
                console.log(err);
                callback(err, null);
            }  else {
                res.bids = result;
                res.code = 200;
                // console.log(result);
                callback(null, res);
            }
        });

}

exports.handle_request = handle_request;