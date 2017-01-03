/**
 * Created by Salmaan on 10/25/2016.
 */

var users = require('../models/users');
var bcrypt = require('bcrypt-nodejs');

function handle_request(msg, callback){

    console.log('in register service handle request');

    var user = new users();
    var res = {};
    user.handle = msg.handle;
    user.email = msg.email;
    user.first_name = msg.first_name;
    user.last_name = msg.last_name;
    user.creation_date = msg.creation_date;
    bcrypt.hash(msg.password, null, null, function (err, hash) {

        if(!err) {

            user.password = hash;
            user.save(function (err) {

                if (!err) {
                    res.code = 200;
                    res.user_id = user._id;
                } else if (err.code == 11000) {
                    res.code = 400;
                    console.log("Duplicate");
                } else {
                    res.code = 500;
                    console.log(err);
                }
                callback(null, res);

            });
        }
    });


}


exports.handle_request = handle_request;