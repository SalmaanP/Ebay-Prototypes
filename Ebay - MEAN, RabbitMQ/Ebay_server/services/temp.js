/**
 * Created by Salmaan on 11/2/2016.
 */
/**
 * Created by Salmaan on 10/26/2016.
 */

// require('../models/mongoose');
var users = require('../models/users');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');


/*function handle_request(msg, callback){
 console.log("In handle request of LOGIN");
 var res = {};
 var username = msg.username;
 var password = msg.password;
 User.find({ username: username }, function(err, results) {
 if (err){
 console.log("Error fetching Login Info");
 res.code = "0";
 }
 else if (results) {
 console.log(results[0]);
 if (bcrypt.compareSync(password, results[0].password)) {
 console.log("Login successfull");
 res.code = "200";
 res.data = results;
 }
 } else {
 console.log("data not found");
 res.code = "400";
 }
 callback(null, res);
 });
 }*/


function handle_request(msg, callback) {


    console.log('Recieved Request');

    res = {};
    users.findOne({handle: msg.handle}, function (err, user) {

        res = {};
        if (!err) {

            if (user) {

                bcrypt.compare(msg.password, user.password, function (err, valid) {

                    if (valid) {

                        if(user.current_login == undefined)
                            user.current_login = 0;
                        users.findByIdAndUpdate(user._id, { $set: { previous_login:user.current_login, current_login:Date.now() }}, { new: true }, function (err, updated_user) {

                            if(!err) {
                                console.log('process request');
                                res.code = 200;
                                res.message = "Success";
                                res.user = updated_user;
                                callback(null, res);
                            } else {
                                console.log(err);
                                callback(err, null);
                            }

                        });

                    } else {
                        res.code = 400;
                        res.message = "Invalid Password";
                        callback(null, res);
                    }

                });

            } else {

                res.code = 400;
                res.message = "User doesnt exist";
                callback(null, res);

            }

        } else {
            res.code = 500;
            console.log(err);
            res.message = "Server Error";
            callback(null, res);
        }


    });

}

exports.handle_request = handle_request;