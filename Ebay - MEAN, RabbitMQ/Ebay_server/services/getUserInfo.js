/**
 * Created by Salmaan on 10/27/2016.
 */

var user = require('../models/users');

function handle_request(msg, callback) {

    console.log('in get user info service handle request');

    var handle = msg.handle;

    user.findOne({handle:handle}, function(err, user){

        if(!err) {
            callback(null, user);
            // console.log(user);
        } else {
            callback(err, null);
        }

    })


}

exports.handle_request = handle_request;