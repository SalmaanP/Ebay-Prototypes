/**
 * Created by Salmaan on 10/27/2016.
 */

var cart = require('../models/cart');

function handle_request(msg, callback) {

    console.log('in add to cart service handle request');

    var res = {};
    var cart_item = new cart();

    cart_item.item = msg.itemObject.item_id;
    cart_item.user = msg.itemObject.user_id;
    cart_item.seller = msg.itemObject.item_seller_id;
    cart_item.item_quantity = msg.itemObject.item_quantity;
    cart_item.item_price = msg.itemObject.item_price;
    cart_item.bid_enabled = msg.itemObject.bid_enabled;
    cart_item.date_added = msg.itemObject.date_added;
    cart_item.item_name = msg.itemObject.item_name;
    cart_item.item_description = msg.itemObject.item_description;

    console.log(cart_item);

    cart_item.save(function(err){

        if (!err) {
                res.code = 200;
        } else if (err.code == 11000) {
            res.code = 400;
            console.log("Duplicate");
        } else {
            res.code = 500;
            console.log(err);
        }
        callback(null, res);

    });


}

exports.handle_request = handle_request;