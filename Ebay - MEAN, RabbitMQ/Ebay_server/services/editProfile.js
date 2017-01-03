/**
 * Created by Salmaan on 10/28/2016.
 */

var users = require('../models/users');

function handle_request(msg, callback) {

    console.log("in edit profile service service");
    var user_id = msg.user_id;
    var res = {};

    users.update({ _id: user_id }, { $set: msg.profileObject}, function(err){

        if(!err){
            res.code = 200;
            callback(null, res);
        } else {
            res.code = 500;
            callback(err, null);
        }

    });

}

exports.handle_request = handle_request;