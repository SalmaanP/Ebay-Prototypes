/**
 * Created by Salmaan on 10/20/2016.
 */

var mongoose = require('mongoose');
var shortId = require('shortid');
var crypto = require('crypto');

var usersSchema = new mongoose.Schema({

    handle: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type:String,
        unique: true,
        required: true
    },
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    zip: String,
    country: String,
    phone: String,
    birthday: String,
    current_login: Date,
    previous_login: Date,
    creation_date: Date,
    hash: String,
    salt: String


});

var adsSchema = new mongoose.Schema({

    id: {
        type: String,
        default: shortId.generate()
    },
    name: String,
    description: String,
    quantity: Number,
    seller_handle: String,
    date_added: Date,
    bid_enabled: Number,
    price: Number,
    bid_end: Date,
    sold_out: Number

});

var bidsSchema = new mongoose.Schema({

    id: {
        type: String,
        default: shortId.generate()
    },
    ad_id: String,
    seller_handle: String,
    buyer_handle: String,
    bid_price: Number,
    base_price: Number,
    date: Date,
    item_name: String,
    item_description: String

});

var cartSchema = mongoose.Schema({

    id: {
        type: String,
        default: shortId.generate()
    },
    user_handle: String,
    item_id: String,
    item_seller_handle: String,
    item_quantity: Number,
    item_price: Number,
    bid_enabled: Number,
    date_added: Date,
    item_name: String,
    item_description: String

});

var transactionsSchema = mongoose.Schema({

    id: {
        type: String,
        default: shortId.generate()
    },
    ad_id: String,
    seller_handle: String,
    buyer_handle: String,
    quantity: Number,
    final_price: Number,
    date: Date,
    item_name: String,
    item_description: String

});

usersSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

usersSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

var users = mongoose.model('users', usersSchema);
var ads = mongoose.model('ads', adsSchema);
var bids = mongoose.model('bids', bidsSchema);
var cart = mongoose.model('cart', cartSchema);
var transactions = mongoose.model('transactions', transactionsSchema);