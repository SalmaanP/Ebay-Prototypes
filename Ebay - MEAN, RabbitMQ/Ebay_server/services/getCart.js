/**
 * Created by Salmaan on 10/27/2016.
 */

var cart = require('../models/cart');

function handle_request(msg, callback) {

    console.log('in get cart service handle request');

    var res = {};
    var user_id = msg.id;
    cart
        .find({user:user_id})
        .populate('item')
        .populate('user')
        .populate('seller')
        .exec(function(err, cart){
           if(err){
               console.log(err);
               callback(err, null);
           }  else {
               res.cart = cart;
               res.code = 200;
               // console.log(cart);
               callback(null, res);
           }
        });


}

exports.handle_request = handle_request;