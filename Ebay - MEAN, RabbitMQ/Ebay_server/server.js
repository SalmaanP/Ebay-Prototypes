/**
 * Created by Salmaan on 10/25/2016.
 */

var amqp = require('amqp');
var util = require('util');

require('./models/mongoose');

var register = require('./services/register');
var login = require('./services/login');
var addItem = require('./services/addItem');
var getItem = require('./services/getItem');
var getUserInfo = require('./services/getUserInfo');
var getRecentAds = require('./services/getRecentAds');
var getCart = require('./services/getCart');
var addToCart = require('./services/addToCart');
var removeFromCart = require('./services/removeFromCart');
var checkout = require('./services/checkout');
var fetchUserOrders = require('./services/fetchUserOrders');
var fetchUserAds = require('./services/fetchUserAds');
var addBids = require('./services/addBids');
var editCart = require('./services/editCart');
var fetchUserBids = require('./services/fetchUserBids');
var editProfile = require('./services/editProfile');
var getItemBids = require('./services/getItemBids');
var getMaxBid = require('./services/getMaxBid');
var updateBids = require('./services/updateBids');
var search = require('./services/search');

var cnn = amqp.createConnection({host:'127.0.0.1'});


cnn.on('ready', function() {


    console.log("RabbitMQ Server is listening on all queues");

    cnn.queue('register_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            register.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('login_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            login.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('addItem_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            addItem.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getItem_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getItem.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getUserInfo_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getUserInfo.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getRecentAds_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getRecentAds.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getCart_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getCart.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('addToCart_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            addToCart.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('removeFromCart_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            removeFromCart.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('checkout_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            checkout.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('fetchUserOrders_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            fetchUserOrders.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('fetchUserAds_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            fetchUserAds.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('addBid_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            addBids.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('editCart_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            editCart.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('fetchUserBids_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            fetchUserBids.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('editProfile_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            editProfile.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getItemBids_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getItemBids.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('getMaxBid_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            getMaxBid.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('updateBids_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            updateBids.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });

    cnn.queue('search_queue', function(q){
        q.subscribe(function(message, headers, deliveryInfo, m){

            // util.log(util.format( deliveryInfo.routingKey, message));
            // util.log("Message: "+JSON.stringify(message));
            // util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));

            search.handle_request(message, function(err,res){
                cnn.publish(m.replyTo, res, {
                    contentType:'application/json',
                    contentEncoding:'utf-8',
                    correlationId:m.correlationId
                });
            });
        });
    });


});

cnn.on('error', function(err) {
    console.log('cnn error: ' + err);
});

cnn.on('close', function connectionClose() {
    console.log('Connection closed');

});