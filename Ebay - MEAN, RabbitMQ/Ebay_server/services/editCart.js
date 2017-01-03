/**
 * Created by Salmaan on 10/28/2016.
 */

var cart = require('../models/cart');

function handle_request(msg, callback) {

    console.log("in edit cart service service");
    var res = {};
    cart
        .findById(msg.cart_id, function (err, cart) {


           cart.item_quantity = cart.item_quantity + msg.quantity;
            cart.save(function(err){
                if (!err) {
                    res.code = 200;
                    callback(null, res);
                } else {
                    res.code = 500;
                    console.log(err);
                    callback(err, res);
                }
            })

        });


}

exports.handle_request = handle_request;