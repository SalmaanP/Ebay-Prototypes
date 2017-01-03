/**
 * Created by Salmaan on 10/27/2016.
 */

var transactions = require('../models/transactions');

function handle_request(msg, callback) {

    console.log("in fetch user orders service service");
    var user_id = msg.user_id;

    transactions
        .find({buyer:user_id})
        .populate('buyer')
        .populate('seller')
        .populate('ad_id')
        .exec(function(err, orders){
            if(!err){
                console.log(orders);
                callback(null, orders);
            } else {
                console.log(err);
                callback(err, null);
            }
        })

}

exports.handle_request = handle_request;