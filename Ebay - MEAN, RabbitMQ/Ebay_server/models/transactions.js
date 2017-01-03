/**
 * Created by Salmaan on 10/26/2016.
 */

var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;

var transactionsSchema = mongoose.Schema({

    transaction_id: {
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
    quantity: Number,
    final_price: Number,
    date: Number,
    item_name: String,
    item_description: String

});

var transactions = mongoose.model('transactions', transactionsSchema);
module.exports = transactions;
