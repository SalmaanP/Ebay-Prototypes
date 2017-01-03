/**
 * Created by Salmaan on 10/25/2016.
 */


var amqp = require('amqp');

var connection = amqp.createConnection({host:'127.0.0.1'});
var rpc = new (require('./amqprpc'))(connection);


function make_request(queue_name, msg_payload, callback){

    rpc.makeRequest(queue_name, msg_payload, function(err, response){
        if(err) {
            console.error(err);
            callback(err, null);
        }
        else{

            // console.log("response", response);
            callback(null, response);
        }

    });
}

exports.make_request = make_request;