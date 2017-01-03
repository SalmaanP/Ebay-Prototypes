/**
 * Created by Salmaan on 9/29/2016.
 */


var mysql = require('./mysql_dao');
var ejs = require('ejs');
var bcrypt = require('bcrypt-nodejs');

var winston = require('./user_tracking');


var mq_client = require('../rpc/client');

var passport = require('passport');

require('../config/passport')(passport);





/**
 * called from submit button of login page, passes control to dao, returns status code
 * @param request.body.signin_handle     coming from angular
 * @param request.body.signin_password   coming from angular
 */
function signIn(request, response, results) {


        if (results.code == 400) {
            response.status(401);
            response.end(results.message);
        }

        else if (results.code == 500) {

            response.status(500);
            response.end("Server Error");
        }

        else if (results.code == 200) {

            request.session.handle = results.user.handle;
            request.session.id = results.user._id;
            request.session.fname = results.user.first_name;
            request.session.lname = results.user.last_name;
            request.session.loggedin = true;
            request.session.current_login = results.user.current_login;
            request.session.previous_login = results.user.previous_login;

            response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            response.header('Pragma', 'no-cache');
            response.header('Expires', 0);
            response.status(200);
            response.send(JSON.stringify({"authenticated": true}));
            response.end();

            winston.log("User with handle: " + request.session.handle + " Signed In");

            // winston.log('info', req.session.username);
            // winston.info("Product Saved to Cart : Product ID = " + req.body.product_id);

        } else {
            console.log(results);
        }

    // });

}

function signOut(request, response) {

    winston.log("User with handle: " + request.session.handle + " Signed out");
    request.session.reset();
    response.redirect('/');

}

/**
 * called from submit button of register page, passes control to dao, return status code
 * @param request.body.register_handle;     coming from angular
 * @param request.body.register_email;   coming from angular
 * @param request.body.register_password;   coming from angular
 */
function register(request, response) {


    var handle = request.body.register_handle;
    var email = request.body.register_email;
    var password = request.body.register_password;
    var first_name = request.body.register_fname;
    var last_name = request.body.register_lname;
    var creation_date = Date.now();

    var msg_payload = {
        "handle": handle,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "creation_date": creation_date
    };
    console.log("sending message to register queue from register");
    mq_client.make_request('register_queue', msg_payload, function (err, results) {

        console.log(results.code);
        if (err) {

            console.log(err);
            response.status(400);
            response.end();

        } else if (results.code == 200) {

            request.session.handle = handle;
            request.session.fname = first_name;
            request.session.lname = last_name;
            request.session.loggedin = true;
            request.session.id = results.user_id;

            response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            response.header('Pragma', 'no-cache');
            response.header('Expires', 0);
            response.status(200);
            response.end(JSON.stringify({'registered': true, 'handle': handle}));
            winston.log("User with handle: " + request.session.handle + " Registered");

        } else if (results.code == 400) {

            response.status(400);
            response.end();

        }

    });

}

/**
 * called from submit button of postAd, passes control to dao, return status code
 * @param request.body.item_name;     coming from angular
 * @param request.body.item_description;   coming from angular
 * @param request.body.quantity;   coming from angular
 * @param request.body.seller_id;   coming from angular
 * @param request.body.bid_enabled;   coming from angular
 * @param request.body.item_price;   coming from angular
 */
function addItem(request, response) {

    var itemObject;
    if (parseInt(request.body.bid_enabled) == 1) {

        var bid_end = Date.now() + 345600000;


        itemObject = {
            "name": request.body.item_name,
            "description": request.body.item_description,
            "seller_handle": String(request.session.handle),
            "seller": request.session.id,
            "date_added": Date.now(),
            "bid_enabled": parseInt(request.body.bid_enabled),
            "price": Number(request.body.item_price),
            "bid_end": bid_end,
            "quantity": 1
        };

    } else {

        itemObject = {
            "name": request.body.item_name,
            "description": request.body.item_description,
            "quantity": Number(request.body.quantity),
            "seller_handle": String(request.session.handle),
            "seller": request.session.id,
            "date_added": Date.now(),
            "bid_enabled": parseInt(request.body.bid_enabled),
            "price": Number(request.body.item_price)
        };


    }

    var msg_payload = {"itemObject": itemObject};
    mq_client.make_request('addItem_queue', msg_payload, function (err, results) {


        if (err) {
            console.log(err);
            response.status(500);
            response.end();
        }
        if (!results) {
            response.status(500);
            console.log(err, results);
            response.end();
        }
        else if (results.code == 200) {
            response.status(200);
            response.send({"rowid": results.ad_id});
            winston.log("User with handle: " + request.session.handle + " Added an item for sale with id:" + results.ad_id);
            response.end();
        } else {
            response.status(400);
            response.end("Invalid Entries");
            console.log("Error in adding advertisement");
            console.log(err);
            response.end();
        }
    });


}

/**
 * called to get details of item, accepts ad id and return json with details or error
 * @param request.params.ad_id;     coming from angular
 */
function getItem(request, response) {

    var item_id = request.params.ad_id;

    var msg_payload = {"item_id": item_id};
    mq_client.make_request('getItem_queue', msg_payload, function (err, results) {

        if (results) {

            response.status(200);
            response.send(JSON.stringify(results));
            winston.log("User with handle: " + request.session.handle + " Viewed an Item with item id: " + item_id);

        } else {

            response.status(400);
            response.send("Specified advertisement does not exist!");
        }

    });

}

/**
 * used to render the item ejs
 */
function renderItemPage(request, response) {

    if (request.session.loggedin) {

        ejs.renderFile('./views/itemdetail.ejs', function (err, res) {
            if (!err) {
                response.status(200);
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.send(res);
            } else {
                response.status(500);
                response.end();
                console.log(err);
            }
        });
    } else {
        renderLoginPage(request, response);
    }

}

/**
 * used to render the add item ejs
 */
function renderNewAdPage(request, response) {

    if (request.session.loggedin) {
        ejs.renderFile('./views/addadvert.ejs', function (err, res) {
            if (!err) {
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.status(200);
                response.send(res);
            } else {
                response.status(500);
                response.end();
                console.log(err);
            }
        })
    } else {
        renderLoginPage(request, response);
    }
}

/**
 * used to get seller information from id to display on item detail page.
 */
function getSellerInfo(request, response) {

    var handle = request.params.seller_id;


    var msg_payload = {"handle": handle};
    mq_client.make_request('getUserInfo_queue', msg_payload, function (err, results) {

        if (!err) {
            response.status(200);
            response.send(results);
        } else {
            response.status(400);
            response.end();
        }
    });

}

/**
 * used to render the home page for client.
 */
function renderHomePage(request, response) {

    if (request.session.loggedin) {

        ejs.renderFile('./views/home.ejs', function (err, res) {
            if (!err) {
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.status(200);
                response.end(res);
            } else {
                response.status(500);
                response.end();
                console.log('Error in rendering home page');
                console.log(err);
            }
        })
    } else {

        renderLoginPage(request, response);

    }

}

/**
 * used to render the login page for client.
 */
function renderLoginPage(request, response) {

    if (request.session.loggedin) {

        renderHomePage(request, response);

    } else {
        ejs.renderFile('./views/login.ejs', function (err, res) {
            if (!err) {
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.status(200);
                response.end(res);
            } else {
                response.status(500);
                response.end();
                console.log('Error in rendering login page');
                console.log(err);
            }
        })
    }

}

/**
 * used to get recent advertisements.
 */
function getRecentAds(request, response) {


    var msg_payload = {};
    mq_client.make_request('getRecentAds_queue', msg_payload, function (err, results) {

        if (!err) {
            response.status(200);
            response.send(results);
            winston.log("User with handle: " + request.session.handle + " viewed recent ads");
        } else {
            response.status(500);
            console.log("Error in getting recent ads");
            console.log(err);
        }

    });
}

/**
 * used to render the root page for client.
 */
function renderRootPage(request, response) {


    if (request.session.loggedin) {

        renderHomePage(request, response);

    } else {

        renderLoginPage(request, response);

    }

}

function renderProfilePage(request, response) {

    if (request.session.loggedin) {

        ejs.renderFile('./views/profile.ejs', function (err, res) {

            if (!err) {

                response.status(200);
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.end(res);


            } else {

                console.log(err);
                renderLoginPage(request, response);

            }

        })

    } else {
        renderLoginPage(request, response);
    }

}

function renderCart(request, response) {

    if (request.session.loggedin) {

        ejs.renderFile('./views/cart.ejs', function (err, res) {
            if (!err) {
                response.status(200);
                response.end(res);
            } else {
                console.log('error in rendering cart');
                response.status(500);
                response.end();
            }
        });

    } else {

        renderLoginPage(request, response);

    }

}

function getCart(request, response) {

    var id = request.session.id;
    var msg_payload = {"id": id};
    mq_client.make_request('getCart_queue', msg_payload, function (err, results) {

        if (!err) {
            console.log(results);
            response.status(200);
            response.end(JSON.stringify(results));
            winston.log("User with handle: " + request.session.handle + " viewed cart");
        } else {

            console.log('error in getCart');
            console.log(err);
            response.status(400);
            response.end();

        }

    });

}

function addToCart(request, response) {


    var itemObject = {
        "item_id": request.body.item_id,
        "user_id": request.session.id,
        "item_seller_id": request.body.item_seller_id,
        "item_quantity": request.body.item_quantity,
        "item_price": request.body.item_price,
        "bid_enabled": request.body.bid_enabled,
        "date_added": Date.now(),
        "item_name": request.body.item_name,
        "item_description": request.body.item_description
    };

    console.log(itemObject);

    var msg_payload = {"itemObject": itemObject};
    mq_client.make_request("addToCart_queue", msg_payload, function (err, results) {

        if (err) {
            console.log(err);
            response.status(400);
            response.end();
        } else if (results.code == 200) {
            console.log(results);
            response.status(200);
            response.end();
            winston.log("User with handle: " + request.session.handle + " Added a product with product id: " + request.body.item_id + " to cart");
        } else {
            response.status(500);
            response.end();
        }


    });

}

function removeFromCart(request, response) {

    if (request.session.loggedin) {


        var msg_payload = {"cart_id": request.body.cart_id};

        mq_client.make_request('removeFromCart_queue', msg_payload, function (err, results) {

            if (results.code == 200) {
                response.status(200);
                response.end();
                winston.log("User with handle: " + request.session.handle + " removed a product with cart id: " + request.body.cart_id + " from cart");
            } else {
                console.log(err);
                response.status(400);
                response.end();
            }

        });

    }

}

function checkout(request, response) {


    var cart = request.body.cart;
    var itemsInCart = 0;
    var errorFlag = 0;

    if (cart.length < 1) {

        response.status(400);
        response.end("No item in cart");

    } else {

        for (item in cart) {


            var temp = cart[item];
            console.log(temp);
            var cart_object = {
                'cart_id': temp._id,
                'ad_id': temp.item._id,
                'seller': temp.seller,
                'buyer': temp.user._id,
                'quantity': temp.item_quantity,
                'final_price': temp.item_price,
                'date': Date.now(),
                'item_name': temp.item_name,
                'item_description': temp.item_description,

            };

            var msg_payload = {"cart_item": temp};
            mq_client.make_request('checkout_queue', msg_payload, function (err, results) {

                if (err) {
                    errorFlag = errorFlag + 1;
                    itemsInCart++;
                    console.log(err);

                } else {
                    itemsInCart = itemsInCart + 1;
                }

            });
        }
        response.status(200);
        response.end(JSON.stringify({"errors": errorFlag, "items": itemsInCart}));
        winston.log("User with handle: " + request.session.handle + " checked out successfully");
    }
}

function fetchUserOrders(request, response) {


    var msg_payload = {"user_id": request.session.id};
    mq_client.make_request('fetchUserOrders_queue', msg_payload, function (err, results) {

        if (!err) {
            response.status(200);
            response.end(JSON.stringify(results));
            console.log(results);
            winston.log("User with handle: " + request.session.handle + " saw user orders");

        } else {

            response.status(400);
            response.end();

        }


    });

}

function fetchUserAds(request, response) {

    var msg_payload = {user_id: request.session.id};
    mq_client.make_request('fetchUserAds_queue', msg_payload, function (err, result) {

        if (!err) {
            response.status(200);
            response.send(JSON.stringify(result));
            winston.log("User with handle: " + request.session.handle + " saw past user advertisements");


        } else {
            response.send(400);
            response.end();
        }


    });

}

function addBid(request, response) {

    var bidObject = {
        "ad_id": request.body.ad_id,
        "seller": request.body.seller,
        "buyer": request.session.id,
        "bid_price": request.body.bid_price,
        "base_price": request.body.base_price,
        "date": Date.now(),
        "item_name": request.body.item_name,
        "item_description": request.body.item_description
    };


    var msg_payload = {"bidObject": bidObject};
    mq_client.make_request('addBid_queue', msg_payload, function (err, result) {

        if (!err) {
            console.log(result);
            response.status(200);
            response.end();
            winston.log("User with handle: " + request.session.handle + " added bid for item id: " + request.body.ad_id);
            winston.bidlog("User with handle: " + request.session.handle + " added bid for item id: " + request.body.ad_id);

        } else {
            response.status(400);
            response.end();
        }

    });

}

function editCart(request, response) {

    item_quantity = request.body.item_quantity;
    cart_id = request.body.cart_id;

    var msg_payload = {"quantity": item_quantity, "cart_id": cart_id};
    mq_client.make_request('editCart_queue', msg_payload, function (err, result) {

        if (!err) {
            if (result.code == 200) {
                response.status(200);
                response.end();
                winston.log("User with handle: " + request.session.handle + " edited cart with cart id " + request.body.cart_id
                    + " to quantity " + request.body.item_quantity);

            } else {
                response.status(500);
                response.end();
            }
        } else {

            response.status(400);
            response.end();
        }

    });

}

function getIdentity(request, response) {

    var identity = {
        "handle": request.session.handle,
        "name": request.session.fname,
        "current_login": request.session.current_login,
        "previous_login": request.session.previous_login,
        "user_id": request.session.id
    };
    response.status(200);
    response.end(JSON.stringify(identity));

}

function renderOrderHistory(request, response) {


    if (request.session.loggedin) {

        ejs.renderFile('./views/order_history.ejs', function (err, res) {

            if (!err) {

                response.status(200);
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.end(res);

            } else {

                console.log(err);
                renderLoginPage(request, response);

            }

        })

    } else {
        renderLoginPage(request, response);
        // response.redirect('/login.ejs');
        response.end();
    }


}

function renderBidHistory(request, response) {


    if (request.session.loggedin) {

        ejs.renderFile('./views/bid_history.ejs', function (err, res) {

            if (!err) {

                response.status(200);
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.end(res);

            } else {

                console.log(err);
                renderLoginPage(request, response);

            }

        })

    } else {
        renderLoginPage(request, response);
        // response.redirect('/login.ejs');
        response.end();
    }


}

function fetchUserBids(request, response) {

    var msg_payload = {"user_id": request.session.id};
    mq_client.make_request("fetchUserBids_queue", msg_payload, function (err, result) {

        if (!err) {
            response.status(200);
            response.send(JSON.stringify(result));
            winston.log("User with handle: " + request.session.handle + " saw user bids");

        } else {
            response.send(400);
            response.end();
        }

    });

}

function renderUserAds(request, response) {


    if (request.session.loggedin) {

        ejs.renderFile('./views/myAds.ejs', function (err, res) {

            if (!err) {

                response.status(200);
                response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                response.header('Pragma', 'no-cache');
                response.header('Expires', 0);
                response.end(res);

            } else {

                console.log(err);
                renderLoginPage(request, response);

            }

        })

    } else {
        renderLoginPage(request, response);
        // response.redirect('/login.ejs');
        response.end();
    }


}

function editProfile(request, response) {


    var msg_payload = {"user_id": request.session.id, "profileObject": request.body.profileObject};
    mq_client.make_request("editProfile_queue", msg_payload, function (err, result) {

        if (!err) {
            console.log(result);
            response.status(200);
            response.end();
            winston.log("User with handle: " + request.session.handle + "edited profile:");

        } else {
            response.send(400);
            response.end();
        }

    });


}

function getItemBids(request, response) {

    item_id = request.body.item_id;
    var msg_payload = {"item_id": item_id};
    mq_client.make_request("getItemBids_queue", msg_payload, function (err, result) {

        if (!err) {
            response.status(200);
            response.end(JSON.stringify(result.bids));
            winston.log("User with handle: " + request.session.handle + " saw item bids for item: " + request.body.item_id);

        } else {
            console.log(err);
            response.status(400);
            response.end();
        }

    });

}

function getMaxBid(request, response) {

    var msg_payload = {"item_id": request.body.item_id};
    console.log(msg_payload);
    mq_client.make_request("getMaxBid_queue", msg_payload, function (err, result) {

        console.log(result);
        if (!err) {
            response.status(200);
            response.end(JSON.stringify(result.bid));
        } else {
            console.log(err);
            response.status(400);
            response.end();
        }

    });

}

function searchItems(request, response) {

    var searchString = request.body.searchString;
    searchString = searchString.toLowerCase().replace(/[^a-z0-9\040]*/g, '');
    winston.log("User with handle: " + request.session.handle + " searched for:  " + request.body.searchString);

    response.status(200);
    response.end(JSON.stringify(rows));

}

exports.signin = signIn;
exports.signOut = signOut;
exports.register = register;
exports.addItem = addItem;
exports.getAd = getItem;
exports.renderAdPage = renderItemPage;
exports.renderNewAdPage = renderNewAdPage;
exports.getSellerInfo = getSellerInfo;
exports.renderHomePage = renderHomePage;
exports.getRecentAds = getRecentAds;
exports.renderLoginPage = renderLoginPage;
exports.renderRootPage = renderRootPage;
exports.renderProfilePage = renderProfilePage;
exports.renderCart = renderCart;
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.checkout = checkout;
exports.removeFromCart = removeFromCart;
exports.fetchUserOrders = fetchUserOrders;
exports.fetchUserAds = fetchUserAds;
exports.addBid = addBid;
exports.editCart = editCart;
exports.getIdentity = getIdentity;
exports.renderOrderHistory = renderOrderHistory;
exports.renderBidHistory = renderBidHistory;
exports.fetchUserBids = fetchUserBids;
exports.renderUserAds = renderUserAds;
exports.editProfile = editProfile;
exports.getItemBids = getItemBids;
exports.getMaxBid = getMaxBid;
exports.searchItems = searchItems;