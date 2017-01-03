/**
 * Created by Salmaan on 10/27/2016.
 */

var cart = require('../models/cart');

function handle_request(msg, callback) {

    console.log('in remove from cart service handle request');
    res = {};

    var cart_id = msg.cart_id;
    console.log(cart_id);
    cart.remove({ _id: cart_id }, function(err){
        if(!err){
            res.code = 200;
            callback(null, res);
        } else {
            console.log(err);
            callback(err, null);
        }
    });


}

exports.handle_request = handle_request;