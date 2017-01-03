/**
 * Created by Salmaan on 9/29/2016.
 */


var mysql = require('./mysql_dao');
var ejs = require('ejs');
var bcrypt = require('bcrypt-nodejs');

var winston = require('./user_tracking');

/**
 * called from submit button of login page, passes control to dao, returns status code
 * @param request.body.signin_handle     coming from angular
 * @param request.body.signin_password   coming from angular
 */
function signIn(request, response) {


    var handle = request.body.signin_handle;
    var password = request.body.signin_password;

    mysql.checkLogin(handle, password, function (err, rows) {
        if (!err) {
            if (rows.length == 1) {
                hash = rows[0].password;

                bcrypt.compare(password, hash, function (err, res) {
                    if (res) {
                        mysql.updateLogin(handle, function (err, rows) {
                            if (err) {
                                console.log("Error in updating login time!");
                            }
                            else {


                                mysql.getSellerInfo(handle, function (err, seller_info) {

                                    if (!err) {
                                        request.session.handle = handle;
                                        request.session.id = seller_info[0].number;
                                        request.session.fname = seller_info[0].first_name;
                                        request.session.lname = seller_info[0].last_name;
                                        request.session.loggedin = true;
                                        request.session.current_login = seller_info[0].current_login;
                                        request.session.previous_login = seller_info[0].previous_login;

                                        response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                                        response.header('Pragma', 'no-cache');
                                        response.header('Expires', 0);
                                        response.status(200);
                                        response.send(JSON.stringify({"authenticated": true}));


                                        winston.log("User with handle: "+request.session.handle+" Signed In");

                                        // winston.log('info', req.session.username);
                                        // winston.info("Product Saved to Cart : Product ID = " + req.body.product_id);

                                    } else {
                                        console.log(err);
                                        response.status(500);
                                        response.end();
                                    }
                                })

                            }
                        });

                    }
                    else {

                        //ADD ERROR LOGIC HERE - USER PRESENT BUT BAD PASSWORD
                        response.status(401);
                        response.end("Invalid login");
                    }
                });
            }
            else {

                //ADD ERROR LOGIC HERE - USER DOES NOT EXIST

                response.status(401);
                response.end("invalid login");
            }
        } else {

            console.log("ERROR in Login query");
            response.status(500);
            response.end("Invalid login");
        }
    });


}

/**
 * called to sign out
 */
function signOut(request, response) {

    winston.log("User with handle: "+request.session.handle+" Signed out");
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
    var password_plain = request.body.register_password;
    var first_name = request.body.register_fname;
    var last_name = request.body.register_lname;

    bcrypt.hash(password_plain, null, null, function (err, hash) {
        if (!err) {

            var userObject = {
                "handle": handle,
                "email": email,
                "password": hash,
                "creation_date": Date.now(),
                "first_name": first_name,
                "last_name": last_name
            };

            mysql.registerUser(userObject, function (err, rows) {
                if (!err) {

                    // SET AFTER REGISTER LOGIC HERE

                    request.session.handle = handle;
                    request.session.fname = first_name;
                    request.session.lname = last_name;
                    request.session.loggedin = true;

                    console.log(rows);
                    response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    response.header('Pragma', 'no-cache');
                    response.header('Expires', 0);
                    response.status(200);
                    response.end(JSON.stringify({'registered': true, 'handle':handle}));
                    winston.log("User with handle: "+request.session.handle+" Registered");

                } else {

                    // SET HANDLE OR EMAIL ALREADY EXISTS ERROR HERE
                    // console.log(err);
                    response.status(400);
                    response.end();
                }
            });
        }
        else {
            console.log("bcrypt error");
            console.log(err);
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
            "date_added": Date.now(),
            "bid_enabled": parseInt(request.body.bid_enabled),
            "price": Number(request.body.item_price)
        };

        console.log(itemObject);

    }


        mysql.addItem(itemObject, function (err, rows) {
            if (!err) {

                response.status(200);
                response.send({"rowid": rows.insertId});
                winston.log("User with handle: "+request.session.handle+" Added an item for sale with id:"+rows.id);
            } else {
                response.status(400);
                response.end("Invalid Entries");
                console.log("Error in adding advertisement");
                console.log(err);
            }
        });


}

/**
 * called to get details of item, accepts ad id and return json with details or error
 * @param request.params.ad_id;     coming from angular
 */
function getItem(request, response) {

    var item_id = request.params.ad_id;


    mysql.getAd(item_id, function (err, rows) {
        if (!err && rows.length != 0) {

            var row = JSON.stringify(rows[0]);
            response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            response.header('Pragma', 'no-cache');
            response.header('Expires', 0);
            response.status(200);
            response.send(row);
            winston.log("User with handle: "+request.session.handle+" Viewed an Item with item id: "+item_id);


        } else {

            response.status(400);
            response.send("Specified advertisement does not exist!");
        }

    })

}

/**
 * used to render the item ejs
 */
function renderItemPage(request, response) {

    if(request.session.loggedin) {

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

    mysql.getSellerInfo(handle, function (err, rows) {
        if (!err && rows.length > 0) {
            response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            response.header('Pragma', 'no-cache');
            response.header('Expires', 0);
            response.status(200);
            response.send(rows[0]);
        } else if (err) {
            console.log(err);
            response.status(500);
            response.end(err);
        } else if (rows.length == 0) {

            // USER NOT FOUND
            console.log(rows);
            response.status(400);
            response.end();
        }
    })

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


    mysql.getRecentAds(function (err, rows) {
        if (!err) {
            response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            response.header('Pragma', 'no-cache');
            response.header('Expires', 0);
            response.status(200);
            response.send(rows);
            winston.log("User with handle: "+request.session.handle+" viewed recent ads");

        } else {
            response.status(500);
            console.log("Error in getting recent ads");
            console.log(err);
        }
    })


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

/**
 * used to render the profile page for client. calls another api to load details from angular
 */
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

/**
 * used to render the cart page for client. calls getCart to load cart details.
 */
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

/**
 * used to get details of items in cart. Requires handle.
 */
function getCart(request, response) {

    var handle = request.session.handle;
    mysql.getCart(handle, function (err, rows) {
        if (err) {
            console.log('error in getCart');
            console.log(err);
            response.status(400);
            response.end();
        } else {
            response.status(200);
            response.end(JSON.stringify(rows));
            winston.log("User with handle: "+request.session.handle+" viewed cart");
        }
    })

}

/**
 * used to add an item to user cart. Requires user handle and item id.
 */
function addToCart(request, response) {


    var itemObject = {
        "item_id": request.body.item_id,
        "user_handle": request.session.handle,
        "item_seller_handle": request.body.item_seller_handle,
        "item_quantity": request.body.item_quantity,
        "item_price": request.body.item_price,
        "bid_enabled": request.body.bid_enabled,
        "date_added": Date.now(),
        "item_name": request.body.item_name,
        "item_description": request.body.item_description
    };


    mysql.addToCart(itemObject, function (err, rows) {

        if (err) {
            console.log(err);
            response.status(400);
            response.end();
        } else if (rows) {
            console.log(rows.affectedRows == 1);
            response.status(200);
            response.end();
            winston.log("User with handle: "+request.session.handle+" Added a product with product id: "+request.body.item_id+" to cart");
        }

    })

}

/**
 * used to remove an item from cart. Requires cart id and item id.
 */
function removeFromCart(request, response) {

    if (request.session.loggedin) {

        var cart_id = request.body.cart_id;
        mysql.removeFromCart(cart_id, function (err, rows) {

            if (err) {
                console.log(err);
                response.status(400);
                response.end();
            } else {

                response.status(200);
                response.end();
                winston.log("User with handle: "+request.session.handle+" removed a product with cart id: "+request.body.cart_id+" from cart");


            }

        })

    }

}

/**
 * used to checkout. Removes items from cart, and adjusts quantities in advertisement table. Also adds transaction.
 */
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
            var cart_object = {
                'ad_id': temp.item_id,
                'seller_handle': temp.item_seller_handle,
                'buyer_handle': temp.user_handle,
                'quantity': temp.item_quantity,
                'final_price': temp.item_price,
                'date': Date.now(),
                'item_name': temp.item_name,
                'item_description':temp.item_description

            };


            mysql.doTransaction(cart_object, function (err, rows) {

                // console.log(rows);
                if (err) {
                    errorFlag = errorFlag + 1;
                    itemsInCart++;
                    console.log(err);

                } else {
                    itemsInCart = itemsInCart + 1;
                }

            }, temp.item_id, parseInt(temp.item_quantity), temp.id);
        }
        response.status(200);
        response.end(JSON.stringify({"errors": errorFlag, "items": itemsInCart}));
        winston.log("User with handle: "+request.session.handle+" checked out successfully");

    }
}

/**
 * used to get details of user orders.
 */
function fetchUserOrders(request, response) {

    var user_handle = request.params.handle;
    mysql.fetchUserOrders(user_handle, function (err, rows) {

        if (!err) {
            response.status(200);
            response.end(JSON.stringify(rows));
            winston.log("User with handle: "+request.session.handle+" saw user orders of user: "+request.params.handle);

        } else {

            response.status(400);
            response.end();

        }

    })

}

/**
 * used to gets user advertisements. requires user handle.
 */
function fetchUserAds(request, response) {

    var user_handle = request.params.handle;
    mysql.fetchUserAds(user_handle, function (err, rows) {

        if (!err) {
            response.status(200);
            response.send(JSON.stringify(rows));
            winston.log("User with handle: "+request.session.handle+" saw user advertisements of user: "+request.params.handle);


        } else {
            response.send(400);
            response.end();
        }

    })

}

/**
 * used to add a bid to an item.
 */
function addBid(request, response) {

    var bidObject = {
        "ad_id": request.body.ad_id,
        "seller_handle": request.body.seller_handle,
        "buyer_handle": request.session.handle,
        "bid_price": request.body.bid_price,
        "base_price": request.body.base_price,
        "date": Date.now(),
        "item_name": request.body.item_name,
        "item_description": request.body.item_description
    };

    console.log(bidObject);

    mysql.addBid(bidObject, function (err, rows) {

        if (!err) {
            console.log(rows);
            response.status(200);
            response.end();
            winston.log("User with handle: "+request.session.handle+" added bid for item id: "+request.body.ad_id);
            winston.bidlog("User with handle: "+request.session.handle+" added bid for item id: "+request.body.ad_id);

        } else {
            response.status(400);
            response.end();
        }

    })

}

/**
 * used to edit an item in cart.
 */
function editCart(request, response){

    item_quantity = request.body.item_quantity;
    cart_id = request.body.cart_id;

    mysql.editCart(cart_id, item_quantity, function(err, rows){

        if(!err){
            if(rows.affectedRows == 1){
                response.status(200);
                response.end();
                winston.log("User with handle: "+request.session.handle+" edited cart with cart id "+request.body.cart_id);


            }
        } else {

            response.status(400);
            response.end();
        }

    });

}

/**
 * used to get identity of user.
 */
function getIdentity(request, response){

    var identity = {"handle": request.session.handle, "name": request.session.fname, "current_login":request.session.current_login, "previous_login": request.session.previous_login};
    response.status(200);
    response.end(JSON.stringify(identity));

}

/**
 * used to render the order history page for client.
 */
function renderOrderHistory(request, response){


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

/**
 * used to render the bid history page for client.
 */
function renderBidHistory(request, response){


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

/**
 * used to get user bids for item details page.
 */
function fetchUserBids(request, response) {

    var user_handle = request.params.handle;


    mysql.fetchUserBids(user_handle, function (err, rows) {

        if (!err) {
            response.status(200);
            response.send(JSON.stringify(rows));
            winston.log("User with handle: "+request.session.handle+" saw user bids for user "+request.params.handle);

        } else {
            response.send(400);
            response.end();
        }

    })

}

/**
 * used to render user ads for client.
 */
function renderUserAds(request, response){


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

/**
 * used to render the edit profile details.
 */
function editProfile(request, response){


    var profileObject = request.body.profileObject;
    console.log(profileObject);
    mysql.editProfile(request.session.handle, profileObject, function(err, rows){

        if(!err){
            console.log(rows);
            response.status(200);
            response.end();
            winston.log("User with handle: "+request.session.handle+"edited profile:");

        } else {
            response.send(400);
            response.end();
        }

    })


}

/**
 * used to get item bids.
 */
function getItemBids(request, response){

    item_id = request.body.item_id;
    mysql.getItemBids(item_id, function(err, row){
        if(!err){
            response.status(200);
            response.end(JSON.stringify(row));
            winston.log("User with handle: "+request.session.handle+" saw item bids for item: "+request.body.item_id);

        } else {
            console.log(err);
            response.status(400);
            response.end();
        }
    })

}

/**
 * used to max bid for an item.
 */
function getMaxBid(request, response){

    item_id = request.body.item_id;
    mysql.getMaxBid(item_id, function(err, row){
        if(!err){
            response.status(200);
            response.end(JSON.stringify(row));
        } else {
            console.log(err);
            response.status(400);
            response.end();
        }
    })

}

/**
 * used to return search results.
 */
function searchItems(request, response){

    var searchString = request.body.searchString;
    searchString = searchString.toLowerCase().replace(/[^a-z0-9\040]*/g, '');
    winston.log("User with handle: "+request.session.handle+" searched for:  "+request.body.searchString);

    mysql.searchItems(searchString, function(err, rows){

        if(!err){
            response.status(200);
            response.end(JSON.stringify(rows));
        } else {
            response.status(400);
            response.end();
        }

    })

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