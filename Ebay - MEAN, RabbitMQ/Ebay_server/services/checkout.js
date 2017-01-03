/**
 * Created by Salmaan on 10/27/2016.
 */

var cart = require('../models/cart');
var transactions = require('../models/transactions');
var ads = require('../models/ads');

function handle_request(msg, callback) {

    var transaction = new transactions();

    console.log('in do transaction service handle request');
    console.log(msg);
    var ad_id = msg.cart_item.item._id;
    var quantity = msg.cart_item.item_quantity;
    var cart_id = msg.cart_item._id;
    var seller = msg.cart_item.seller._id;
    var buyer = msg.cart_item.user._id;
    var price = msg.cart_item.item_price;
    var item_name = msg.cart_item.item_name;
    var item_description = msg.cart_item.item_description;

    updateAdQuantityAndRemove(ad_id, quantity, cart_id, function (err) {
        if (!err) {

            transaction.ad_id = ad_id;
            transaction.seller = msg.cart_item.seller;
            transaction.buyer = msg.cart_item.user._id;
            transaction.quantity = quantity;
            transaction.final_price = msg.cart_item.item_price;
            transaction.date = Date.now();
            transaction.item_name = msg.cart_item.item_name;
            transaction.item_description = msg.cart_item.item_description;
            transaction.save(function (err) {
                if (!err) {
                    console.log('transaction added');
                    callback(null, 200);
                }
            })
        } else {
            callback(err);
        }
    })

}

function updateAdQuantityAndRemove(ad_id, item_quantity, cart_id, done) {


    ads.findById(ad_id, function (err, ad) {
        if (!err) {
            console.log('ad found');
            if (ad.sold_out == 0) {


                var updated_quantity = ad.quantity - item_quantity;
                if (updated_quantity >= 0) {
                    console.log('quantity ok');
                    ad.quantity = updated_quantity;
                    if (updated_quantity == 0) {
                        console.log('quantity 0 now');
                        ad.sold_out = 1;
                    }
                    ad.save(function (err, updatedAd) {
                        if (!err) {
                            console.log('ad updated');
                            cart.remove({_id: cart_id}, function (err) {
                                if (!err) {
                                    console.log('removed from cart');
                                    done(null);

                                } else {
                                    console.log(err);
                                    done(err);
                                }
                            });

                        } else {
                            console.log(err);
                            done(err);
                        }
                    });
                } else {
                    console.log('out of stock');

                }

            }

        } else {
            console.log(err);
            done(err);
        }
    });

}


exports.handle_request = handle_request;