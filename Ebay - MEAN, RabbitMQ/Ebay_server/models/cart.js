/**
 * Created by Salmaan on 10/26/2016.
 */
var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;

var cartSchema = mongoose.Schema({

    cart_id: {
        type: String,
        default: shortId.generate()
    },
    user: {
        type:Schema.Types.ObjectId,
        ref: 'users'
    },
    item: {
        type:Schema.Types.ObjectId,
        ref: 'ads'
    },
    seller: {
        type:Schema.Types.ObjectId,
        ref: 'users'
    },
    item_quantity: Number,
    item_price: Number,
    bid_enabled: Number,
    date_added: Number,
    item_name: String,
    item_description: String

});

var cart = mongoose.model('cart', cartSchema);
module.exports = cart;