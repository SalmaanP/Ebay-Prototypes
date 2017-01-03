/**
 * Created by Salmaan on 9/28/2016.
 */

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var poolSize = 100;
var queueSize = 1000;
// var ConnectionPool;


var ConnectionPool = mysql.createPool({
        connectionLimit: poolSize,
        queueLimit: queueSize,
        waitForConnection: true,
        host: 'localhost',
        user: 'root',
        password: 'test',
        database: 'ebay'
    });





function runQuery(query, callback, object) {

    ConnectionPool.getConnection(function (err, connection) {
        if (err) {

            console.log('Error in runQuery');
            console.log(err);
            callback(err);

        } else {
            connection.query(query, object, function (err, rows) {
                if (rows) {
                    // connection.release();
                    callback(err, rows);
                    // console.log(connection.threadId);

                }
                if (err) {
                    console.log('Error in runQuery');
                    console.log(err);
                    // connection.release();
                    callback(err, rows);

                }
            });

            connection.release();
        }

    });


}

function registerUser(userObject, callback) {

    var query = "insert into users SET ?";
    runQuery(query, function (err, rows) {

        if (err) {
            console.log('Error in registerUser');
            callback(err);
        } else {
            callback(err, rows);
        }


    }, userObject);


}

function loginUser(handle, password, callback) {

    var query = "select handle, password from users where handle='" + handle + "'";

    runQuery(query, function (err, rows) {
        if (err) {
            console.log('Error in loginUser');
            callback(err);
        } else {
            callback(err, rows);
        }

    });


}

function updateLogin(handle, callback) {

    // var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var query = "update users set previous_login = current_login, current_login='" + Date.now() + "' where handle='" + handle + "'";

    runQuery(query, function (err, rows) {
        if (err) {
            console.log('error in updateLogin');
            callback(err);
        } else {
            callback(err, rows);
        }
    });

}

function addItem(itemObject, callback) {

    var query = "insert into ads SET ?";
    runQuery(query, function (err, rows) {
        if (err) {
            console.log('error in addItem');
            callback(err);
        } else {
            callback(err, rows);
        }
    }, itemObject);

}

function getItem(item_id, callback) {


    var query = "select * from ads where id = ?";
    runQuery(query, function (err, rows) {
        if (err) {
            console.log('error in getItem');
            callback(err);
        } else {
            callback(err, rows);
        }

    }, item_id);

}

function getSellerInfo(handle, callback) {

    query = "select * from users where handle = '" + handle + "'";
    runQuery(query, function (err, rows) {
        if (err || (rows.length == 0)) {
            console.log('error in getSellerInfo integer');
            callback(err, rows);
        } else {
            // console.log(rows);
            callback(err, rows);
        }
    });

}

function getRecentAds(callback) {

    query = "select * from ads where sold_out = 0 order by date_added DESC LIMIT 15";
    runQuery(query, function (err, rows) {
        if (err) {
            console.log('error in getRecentAds');
        } else {
            callback(err, rows);
        }
    })

}

function getCart(handle, callback) {

    // var query = "select cart.cartId,cart.productId,cart.quantity,cart.total,cart.userId,product.productPrice,product.productName,product.quantity As Stock,product.productId from cart join product where cart.userId='" + req.session.userid + "' AND cart.productId=product.productId;";
    //CHaNGED query here with join.

    // query = "select * from cart join ads where cart.user_handle = '" + handle + "' and cart.item_id=ads.id";
    query = "select cart.*, ads.quantity as stock from cart join ads where user_handle = '"+handle+"'and cart.item_id=ads.id";
    runQuery(query, function (err, rows) {

        if (err) {
            console.log('error in getCart dao');
            callback(err, rows);
        } else {
            callback(err, rows);
        }

    });

}

function addToCart(itemObject, callback) {

    query = "insert into cart SET ?";

    runQuery(query, function (err, rows) {
        if (err) {
            console.log("Error in adding to cart");
            callback(err);
        } else {
            callback(err, rows);
        }
    }, itemObject);

}

function updateAdQuantity(ad_id, quantity, callback) {

    query1 = "update ads set quantity = quantity - "+quantity+" where id = "+ad_id+" and (quantity - "+quantity+") >= 0";
    query2 = "update ads set sold_out = CASE WHEN quantity = 0 THEN 1 ELSE 0 END WHERE id = " + ad_id;
    runQuery(query1, function (err, rows) {
        if (err) {
            console.log("error in updating ad table quantity");
            callback(err, rows);
        } else {

            if (rows.changedRows == 1) {
                runQuery(query2, function (err, rows) {
                    if (err) {
                        console.log("ERROR while updating soldout");
                    }
                    // SEE IF ROW IS CHANGED AND REMOVE FROM CART AND SHOW SOLD OUT MESSAGE
                    callback(err, rows);
                });
            }
        }
    })

}

function addTransaction(cart_object, callback) {

    query = "insert into transactions SET ?";
    runQuery(query, function (err, rows) {
        if (err) {
            console.log("Error in adding transaction");
            callback(err);
        } else {

            callback(err, rows);

        }
    }, cart_object);

}

function doTransaction(cart_object, callback, ad_id, quantity, cart_id) {

    updateAdQuantity(ad_id, quantity, function (err, rows) {
        if (!err) {
            removeFromCart(cart_id, function (err, rows) {
                if (!err) {
                    addTransaction(cart_object, function (err, rows) {
                        if (!err) {
                            callback(err, rows);
                        }
                    })
                }
            })
        }
    });
}

function removeFromCart(cart_id, callback) {

    query = "delete from cart where id = " + cart_id;

    runQuery(query, function (err, rows) {

        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log(rows);
            callback(err, rows);
        }

    });

}

function fetchUserOrders(handle, callback){

    query = "select * from transactions where buyer_handle ='"+handle+"'";
    runQuery(query, function(err, rows){

        if(!err){
            callback(err, rows);
        } else {
            console.log(err);
            callback(err, rows);
        }

    })

}

function fetchUserAds(handle, callback){

    query = "select * from ads where seller_handle ='"+handle+"'";
    runQuery(query, function(err, rows){

        if(!err){
            callback(err, rows);
        } else {
            console.log(err);
            callback(err, rows);
        }

    })

}

function addBid(bidObject, callback){

    query = "insert into bids SET ?";
    runQuery(query, function(err, rows){
        if(!err){
            callback(err, rows);
        } else {
            console.log('error in adding bid');
            callback(err);
        }
    }, bidObject);

}

function editCart(cart_id, quantity, callback){

    query = "update cart set item_quantity = item_quantity + "+quantity+" where id ="+ cart_id;
    runQuery(query, function(err, rows){

        if(!err){
            callback(err, rows);
        } else {
            console.log("error in editing cart");
            callback(err);
        }

    })

}

function updateBids(current_time, callback){

    query = "select id, date_added, seller_handle from ads where bid_end <= "+ current_time +" and bid_enabled = 1 and sold_out = 0";
    runQuery(query, function(err,bids_finished){
        if(!err){
            if(bids_finished != []){


                for( var i =0; i < bids_finished.length; i++) {

                    current_ad = bids_finished[i].id;

                    // var query2 = "select ad_id, buyer_handle, seller_handle, MAX(bid_price) as final_bid from bids where ad_id = "+bids_finished[i].id;
                    var query2 = "select ad_id, buyer_handle, seller_handle, bid_price as final_bid from bids where bids.bid_price IN(select MAX(bids.bid_price) as amount from bids where ad_id = "+bids_finished[i].id +") AND ad_id = "+bids_finished[i].id;

                    runQuery(query2, function(err, max_bid){
                        if(!err){
                            if(max_bid[0].ad_id != null){

                                var transaction_object = {"ad_id":max_bid[0].ad_id,
                                                        "seller_handle":max_bid[0].seller_handle,
                                                        "buyer_handle":max_bid[0].buyer_handle,
                                                        "final_price" : max_bid[0].final_bid,
                                                        "date" : Date.now()
                                };

                                var query3 = "insert into transactions SET ?";
                                runQuery(query3, function(err, inserted_transaction){

                                    if(!err){
                                        console.log(inserted_transaction);
                                        var query4 = "update ads SET sold_out = 1 where id = "+max_bid[0].ad_id;
                                        runQuery(query4, function(err, ad_updated){

                                            if(!err){
                                                console.log(ad_updated);
                                                console.log("done");
                                                console.log(ad_updated);
                                            }

                                        })
                                    } else { console.log("error in query 3");}

                                }, transaction_object)
                            } else {

                                var query5 = "update ads SET sold_out = 1 where id = "+current_ad;
                                runQuery(query5, function(err, ad_updated){

                                    if(!err){
                                        console.log(ad_updated);
                                        console.log("done");
                                    }

                                })


                            }
                        } else { console.log("Error in query 2");}
                    })
                }
            }
            // console.log('no bids');
        } else { console.log("error in query 1"); }
    })

}

function fetchUserBids(handle, callback){

    query = "select * from bids where buyer_handle ='"+handle+"'";
    runQuery(query, function(err, rows){
        if(!err){
            callback(err, rows);
        } else {
            console.log('error in fetching user bids');
            callback(err);
        }
    })


}

function editProfile(handle, profileObject, callback){

    query = "UPDATE users set ? where handle='"+handle+"'";
    runQuery(query, function(err, rows){

        if(!err){
            callback(err, rows);
        } else {

            console.log(err);
            callback(err);

        }

    },profileObject);

}

function getItemBids(item_id, callback){

    // query = "select *, max(bid_price) as max_bid from bids where ad_id = "+item_id+" Order By date DESC";
    query = "select * from bids where ad_id = "+item_id+" Order By date DESC";
    runQuery(query, function(err,row){

        if(!err){
            callback(err, row);
        } else {
            console.log('error in getitembids');
            callback(err);
        }

    })

}

function getMaxBid(item_id, callback){

    query = "select max(bid_price) as max_bid from bids where ad_id = "+item_id
    // query = "select * from bids where ad_id = "+item_id+" Order By date DESC";
    runQuery(query, function(err,row){

        if(!err){
            callback(err, row);
        } else {
            console.log('error in getmaxbid');
            callback(err);
        }

    })

}

function searchItems(searchString, callback){

    // searchString = '%'+mysql.escape(searchString)+'%';

    query = "select * from ads where (name LIKE '%"+searchString+"%' or description like '%"+searchString+"%') and sold_out = 0 LIMIT 40";
    runQuery(query, function(err, rows){

        if(err){
           console.log("error in searchstring");
            callback(err);
        } else {
            callback(err, rows);
        }

    })
}

exports.checkLogin = loginUser;
exports.registerUser = registerUser;
exports.updateLogin = updateLogin;
exports.addItem = addItem;
exports.getAd = getItem;
exports.getSellerInfo = getSellerInfo;
exports.getRecentAds = getRecentAds;
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.doTransaction = doTransaction;
exports.removeFromCart = removeFromCart;
exports.fetchUserOrders = fetchUserOrders;
exports.fetchUserAds = fetchUserAds;
exports.addBid = addBid;
exports.editCart = editCart;
exports.updateBids = updateBids;
exports.fetchUserBids = fetchUserBids;
exports.editProfile = editProfile;
exports.getItemBids = getItemBids;
exports.getMaxBid = getMaxBid;
exports.searchItems = searchItems;
// exports.initPool = initPool;