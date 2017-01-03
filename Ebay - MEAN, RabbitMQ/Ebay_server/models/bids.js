/**
 * Created by Salmaan on 10/26/2016.
 */

var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;

var bidsSchema = new mongoose.Schema({

    bid_id: {
        type: String,
        default: shortId.generate()
    },
    ad_id: {
        type: Schema.Types.ObjectId,
        ref: 'ads'
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    bid_price: Number,
    base_price: Number,
    date: Number,
    item_name: String,
    item_description: String

});

var bids = mongoose.model('bids', bidsSchema);
module.exports = bids;