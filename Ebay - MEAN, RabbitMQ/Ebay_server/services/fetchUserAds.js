/**
 * Created by Salmaan on 10/28/2016.
 */

var ads = require('../models/ads');

function handle_request(msg, callback) {

    console.log("in fetch user ads service service");
    var user_id = msg.user_id;

    ads
        .find({seller:user_id})
        .populate('seller')
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