/**
 * Created by Salmaan on 10/26/2016.
 */

var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;


var adsSchema = new mongoose.Schema({

    ad_id: {
        type: String,
        default: shortId.generate()
    },
    name: String,
    description: String,
    quantity: Number,
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    date_added: Number,
    bid_enabled: Number,
    price: Number,
    bid_end: Number,
    sold_out: Number

});

var ads = mongoose.model('ads', adsSchema);
module.exports = ads;