/**
 * Created by Salmaan on 10/28/2016.
 */

var bids = require('../models/bids');

function handle_request(msg, callback) {

    console.log("in fetch user bids service service");
    var user_id = msg.user_id;

    bids
        .find({buyer:user_id})
        .populate('ad_id buyer seller')
        .exec(function(err, orders){
            if(!err){
                // console.log(orders);
                callback(null, orders);
            } else {
                console.log(err);
                callback(err, null);
            }
        })

}

exports.handle_request = handle_request;