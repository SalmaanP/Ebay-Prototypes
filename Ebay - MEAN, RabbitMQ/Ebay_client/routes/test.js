/**
 * Created by Salmaan on 9/28/2016.
 */

var ads = require('../../Ebay_server/models/ads');


function testquery(request, response) {



    ads
        .find({sold_out: {$eq:0}})
        .sort('-date_added')
        .populate('seller')
        .exec(function (err, ad) {
            if (!err) {
                response.status(200);
                response.send(ad);
                winston.log("User with handle: " + request.session.handle + " viewed recent ads");
            } else {
                response.status(500);
                console.log("Error in getting recent ads");
                console.log(err);
            }
        });


}


exports.testquery = testquery;