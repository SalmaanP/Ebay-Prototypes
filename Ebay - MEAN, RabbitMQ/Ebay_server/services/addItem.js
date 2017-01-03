/**
 * Created by Salmaan on 10/27/2016.
 */

var ads = require('../models/ads');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function handle_request(msg, callback) {

    console.log('in add item service handle request');


    var res = {};
    var ad = new ads();


    ad.name = msg.itemObject.name;
    ad.description = msg.itemObject.description;
    ad.quantity = Number(msg.itemObject.quantity);
    ad.seller = msg.itemObject.seller;
    ad.date_added = Number(msg.itemObject.date_added);
    ad.bid_enabled = Number(msg.itemObject.bid_enabled);
    ad.price = Number(msg.itemObject.price);
    ad.sold_out = 0;
    if(msg.itemObject.bid_enabled == 1)
        ad.bid_end = (Number(Date.now()) + 345600000);



    ad.save(function(err){
        if(!err){
            res.code = 200;
            res.ad_id = ad._id;
            console.log(res.ad_id);
            callback(null, res);
        } else {
            console.log(err);
            res.code = 400;
            callback(err, null);
        }
    });



}

exports.handle_request = handle_request;