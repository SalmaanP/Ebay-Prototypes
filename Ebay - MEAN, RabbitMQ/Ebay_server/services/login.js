/**
 * Created by Salmaan on 10/26/2016.
 */

// require('../models/mongoose');
var users = require('../models/users');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');





function handle_request(msg, callback) {


    console.log('in login service request');


    res = {};
    users.findOne({handle: msg.handle}, function (err, user) {

        if(err){
            console.log(err);
            callback(err, null);
        }

        if (user) {

            if (bcrypt.compareSync(msg.password, user.password)) {


                res.code = 200;
                res.message = "Success";
                res.user = user;
                callback(null, res);



            } else {
                res.code = 400;
                res.message = "Invalid Password";
                return callback(null, res);
            }


        } else {
            res.code = 400;
            res.message = "Invalid Handle";
            return callback(null, res);
        }


    });

}

exports.handle_request = handle_request;