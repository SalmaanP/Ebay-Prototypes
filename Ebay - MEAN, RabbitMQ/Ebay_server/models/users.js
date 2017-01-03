/**
 * Created by Salmaan on 10/26/2016.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');

var usersSchema = new mongoose.Schema({

    handle: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type:String,
        unique: true,
        required: true
    },
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    zip: String,
    country: String,
    phone: String,
    birthday: String,
    current_login: Number,
    previous_login: Number,
    creation_date: Number,
    password: String


});

usersSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

usersSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

var users = mongoose.model('users', usersSchema);
module.exports = users;