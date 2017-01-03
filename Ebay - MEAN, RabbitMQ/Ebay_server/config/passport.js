/**
 * Created by Salmaan on 10/27/2016.
 */

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

var mq_client = require('../rpc/client');


passport.use(new LocalStrategy(
    function(handle, password, done) {
        var msg_payload = {"handle": handle, "password": password};
        mq_client.make_request('login_queue', msg_payload, function(err, result){

            if(err){
                return done(err);
            }
            if(result.code == 200){
                return done(null, user);
            }
            else{
                return done(null, false, { message: 'Incorrect Credentials.' });
            }

        });

    }
));
