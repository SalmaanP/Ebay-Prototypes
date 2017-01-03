/**
 * Created by Salmaan on 10/28/2016.
 */

var bids = require('../models/bids');
var ads = require('../models/ads');
var transactions = require('../models/transactions');

function handle_request(msg, callback) {

    console.log('in update bids handle service request');
    var res = {};
    ads
        .find({
            $and: [
                {bid_end: {$lte: msg.current_time}},
                {bid_enabled: 1},
                {sold_out: 0}

            ]
        })
        .exec(function (err, results) {

            if (!err) {
                if (results.length != 0) {
                    for (let i = 0; i < results.length; i++) {

                        console.log(results[i]._id);
                        bids
                            .findOne({ad_id: results[i]._id})
                            .sort('-bid_price')
                            .exec(function (err, maxBid) {
                                if (err) {
                                    // console.log('error in finding max bid - update bids');
                                    res.code(500);
                                    callback(err, null);
                                } else {
                                    // console.log('max bid found');
                                    if (maxBid != null) {
                                        var transaction = new transactions();

                                        transaction.ad_id = maxBid.ad_id;
                                        transaction.seller = maxBid.seller;
                                        transaction.buyer = maxBid.buyer;
                                        transaction.quantity = 1;
                                        transaction.final_price = maxBid.bid_price;
                                        transaction.date = Date.now();
                                        transaction.item_name = maxBid.item_name;
                                        transaction.item_description = maxBid.item_description;
                                        transaction.save(function (err) {
                                            if (!err) {
                                                // console.log('transaction added');
                                                ads.update({_id: maxBid.ad_id}, {sold_out: 1}, function (err, done) {
                                                    if (!err) {
                                                        // console.log(done);
                                                        // console.log('ad updated');
                                                        res.code = 200;
                                                        callback(null, res);
                                                    } else {
                                                        // console.log('error in updating ad - update bid');
                                                        res.code = 500;
                                                        callback(err, null);
                                                    }
                                                })


                                            } else {
                                                // console.log('error in adding transaction - update bid');
                                                res.code = 500;
                                                callback(err, null);
                                            }
                                        })

                                    } else {
                                        // console.log('no bids on item');
                                        ads.update({_id: results[i]._id}, {sold_out: 1}, function (err, done) {
                                            if (!err) {
                                                // console.log('ad updated');
                                                res.code = 200;
                                                callback(null, res);
                                            } else {
                                                // console.log('error in updating ad - update bid - no bids');
                                                res.code = 500;
                                                callback(err, null);
                                            }
                                        })
                                    }

                                }
                            })
                    }
                } else {
                    // console.log('no ads satisfying criteria - update bid');
                    res.code = 200;
                    callback(null, res);
                }
            } else {
                // console.log('error in first query, finding ads - updating bids');
                // console.log(err);
                callback(err, null);
            }

        });
}

exports.handle_request = handle_request;