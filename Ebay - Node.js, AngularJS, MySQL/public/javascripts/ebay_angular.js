/**
 * Created by Salmaan on 10/6/2016.
 */

var ebay = angular.module('ebay', [], function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

});

ebay.controller('profile_controller', function ($scope, $http, $window, $location, $timeout) {

    function parseTimestamp() {

        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min  = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec  = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        var year = date.getFullYear();

        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    }


    var handle = $location.path().split("/")[2] || "Unknown";
    if (handle == "Unknown") {

        $window.location.href = '/home';

    } else {

        $http({

            method: "GET",
            url: "/identify"
        })
            .then(function success(response) {
                    $scope.user_handle = response.data.handle;
                    $scope.user_name = response.data.name;
                    $scope.last_login = parseTimestamp(response.data.previous_login);



                    console.log(response);
                },
                function error(err) {

                });


        $http({
            method: "GET",
            url: '/getSellerInfo/' + handle
        })
            .then(function success(data) {
                    console.log(data.data);
                    $scope.profile_handle = data.data.handle;
                    $scope.fname = data.data.first_name;
                    $scope.lname = data.data.last_name;
                    $scope.id = data.data.number;
                    $scope.city = data.data.city;
                    $scope.country = data.data.country;
                    $scope.handle = data.data.handle;
                    $scope.dob = data.data.birthday;
                    $scope.email = data.data.email;
                    $scope.address = data.data.address;
                    $scope.zip = data.data.zip;
                    $scope.phone = data.data.phone;
                    $scope.ownsPage = $scope.profile_handle == $scope.user_handle;
                },
                function error(err) {
                    console.log(err);
                    $window.location.assign('/404');
                });

        $http({
            method: "GET",
            url: '/fetchUserOrders/' + handle
        })
            .then(function success(data) {
                    console.log(data);
                },
                function error(err) {
                    console.log(err);
                });

        $http({
            method: "GET",
            url: '/fetchUserAds/' + handle
        })
            .then(function success(data) {
                    console.log(data);
                },
                function error(err) {
                    console.log(err);
                })


    }

    $scope.editProfile = function () {

        var profileObject = {
            "email": $scope.email,
            "first_name": $scope.fname,
            "last_name": $scope.lname,
            "address": $scope.address,
            "city": $scope.city,
            "zip": $scope.zip,
            "country": $scope.country,
            "phone": $scope.phone,
            "birthday": $scope.dob
        };

        console.log(profileObject);

        $http({
            method: 'POST',
            url: '/editProfile',
            data: {"profileObject": profileObject}
        })
            .then(function success(data) {

                    $scope.editSuccess = true;
                    $timeout(function(){
                        $scope.editSuccess = false;
                    }, 5000);

                },
                function error(err) {
                    $scope.editFail = true;
                    $timeout(function(){
                        $scope.editFail = false;
                    }, 5000);

                })


    };

    $scope.navtopostAd = function () {

        $window.location.assign('/postAd');

    };

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

});

ebay.controller('login_controller', function ($scope, $http, $window, $timeout) {

    $scope.register = function () {


        $scope.invalidRegister = $scope.register_password != $scope.confirm_password;
        if ($scope.invalidRegister)
            $scope.registererror = 'Passwords Dont Match';
        else {
            $http({
                method: 'POST',
                url: '/register',
                data: {
                    'register_handle': $scope.register_handle,
                    'register_email': $scope.register_email,
                    'register_password': $scope.register_password,
                    'register_fname': $scope.register_fname,
                    'register_lname': $scope.register_lname
                }
            })
                .then(function success(response) {
                        console.log(response);
                        if (response.data.registered) {
                            $scope.validRegister = true;
                            $scope.registersuccess = 'Success, redirecting you to profile';
                            $timeout(function(){
                                $window.location.href = '/profile/'+response.data.handle;
                            }, 1000);

                        }
                    },
                    function error(response) {
                        if (response.status == 400) {
                            $scope.invalidRegister = true;
                            $scope.registererror = 'Handle or Email Already Taken';
                        }
                    });
        }

    };

    $scope.login = function () {


        if ($scope.signin_handle == undefined || $scope.signin_password == undefined) {

            $scope.invalidLogin = true;
            $timeout(function () {
                return $scope.invalidLogin = false;
            }, 2000);

        } else {

            $http({
                method: 'POST',
                url: '/signIn',
                data: {"signin_handle": $scope.signin_handle, "signin_password": $scope.signin_password}
            })
                .then(function success(data) {
                        if (data.data.authenticated) {
                            $window.location.href = '/home';
                        }
                    },
                    function error(data) {
                        if (data.status == 401) {
                            $scope.invalidLogin = true;
                            $timeout(function () {
                                return $scope.invalidLogin = false;
                            }, 2000);
                        }
                    })
        }

    }

});

ebay.controller('item_controller', function ($scope, $http, $location, $window, $timeout) {


    function parseTime(time) {

        var totalSec = time;
        var days = Math.floor(totalSec / 86400);
        var hours = parseInt(totalSec / 3600) % 24;
        var minutes = parseInt(totalSec / 60) % 60;
        var seconds = Math.floor(totalSec % 60);
        return days + " days" + " " + hours + " hours" + " " + minutes + " minutes" + " " + seconds + " seconds";
    }


    //$locationProvider.html5Mode(true);
    var ad_id = $location.path().split("/")[2] || "Unknown";
    $scope.bid_now = false;
    $scope.buy_now = false;
    $scope.for_bid = false;
    $scope.for_buy = false;
    $scope.out_of_stock = false;
    $scope.button_text = '';

    if (ad_id == "Unknown") {

        $window.location.href = '/home';

    } else {

        $http({

            method: "GET",
            url: "/identify"
        })
            .then(function success(response) {
                    $scope.user_handle = response.data.handle;
                    $scope.user_name = response.data.name;
                    console.log(response);
                },
                function error(err) {
                    $scope.user_handle = 'Hi!';
                    $scope.user_name = 'Hey!';
                });

        $http({
            method: 'GET',
            url: '/getAdDetail/' + ad_id
        })
            .success(function (data) {

                console.log(data);
                $scope.item_name = data.name;
                $scope.item_description = data.description;
                $scope.item_quantity = data.quantity;
                $scope.item_price = data.price;
                $scope.seller_handle = data.seller_handle;
                $scope.bid_enabled = data.bid_enabled;
                $scope.item_date = data.date_added;
                $scope.sold_out = data.sold_out;
                var milliseconds = (new Date).getTime();
                $scope.bid_end = (data.bid_end - milliseconds)/1000;

                $scope.bid_end = parseTime($scope.bid_end);



                if ($scope.bid_enabled == 1) {
                    $scope.bid_now = true;
                    $scope.for_bid = true;
                    $scope.button_text = 'Bid Now!';

                    $http({
                        method: 'POST',
                        url: '/getItemBids',
                        data: {"item_id": data.id}
                    })
                        .then(function success(data) {
                                $scope.bids = data.data;

                            if($scope.bids.length == 0){
                                $scope.nobids = true;
                            }
                            },
                            function error(err) {
                                console.log(err);
                            });

                    $http({
                        method: 'POST',
                        url: '/getMaxBid',
                        data: {"item_id": data.id}
                    })
                        .then(function success(data) {
                                $scope.maxbids = data.data;
                                $scope.max_bid = $scope.maxbids[0].max_bid;
                                if($scope.max_bid == null)
                                    $scope.max_bid = $scope.item_price;

                            },
                            function error(err) {
                                console.log(err);
                            })

                }
                else if($scope.bid_enabled == 0 && $scope.sold_out != 1) {
                    $scope.for_buy = true;
                    $scope.buy_now = true;
                    $scope.button_text = 'Add To Cart!';
                }

                if ($scope.item_quantity == 0.00 || $scope.sold_out == 1) {
                    $scope.out_of_stock = true;
                    $scope.bid_now = false;
                    $scope.buy_now = false;
                    $scope.button_text = 'Out of Stock!';
                }

                $http({
                    method: 'GET',
                    url: '/getSellerInfo/' + $scope.seller_handle
                })
                    .then(function success(data) {

                        $scope.seller_name = data.data.first_name + " " + data.data.last_name + " (" + data.data.handle + ")";
                        $scope.seller_address = data.data.city + ", " + data.data.country;

                    }, function error(data) {
                        console.log(data);
                    });

            })
            .error(function (data) {
                console.log(data);
            })
    }

    $scope.button_click = function () {
        if ($scope.buy_now) {

            if (parseInt($scope.user_input) > $scope.item_quantity || parseInt($scope.user_input) < 1) {

                $scope.lessquantity = true;
                $timeout(function(){
                    $scope.lessquantity = false;
                },3000);


            } else {

                $http({
                    method: "POST",
                    url: '/addToCart',
                    data: {
                        "item_id": ad_id,
                        "item_seller_handle": $scope.seller_handle,
                        "item_quantity": $scope.user_input,
                        "item_price": $scope.item_price,
                        "bid_enabled": $scope.bid_enabled,
                        "item_name": $scope.item_name,
                        "item_description": $scope.item_description
                    }
                })
                    .then(function success(data) {
                        console.log(data);
                            $scope.item_added = true;
                            $timeout(function(){
                                $scope.item_added = false;
                                $window.location.reload();
                            }, 3000);
                        },
                        function error(err) {
                            console.log(err);
                        })
            }

        } else if ($scope.bid_now) {

            if($scope.user_input <= $scope.max_bid){

                console.log('Less Bid');
                $scope.lessbid = true;
                $timeout(function(){
                    $scope.lessbid = false;
                }, 2000);

            } else {


                $http({
                    method: "POST",
                    url: "/addBid",
                    data: {
                        "ad_id": ad_id,
                        "seller_handle": $scope.seller_handle,
                        "bid_price": $scope.user_input,
                        "base_price": $scope.item_price,
                        "item_name":$scope.item_name,
                        "item_description":$scope.item_description
                    }
                })
                    .then(function success(data) {
                            console.log(data);
                            $window.location.reload();
                        },
                        function error(err) {
                            console.log(err);
                        })
            }


        } else {
            console.log('Out of Stock!');
        }
    };

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

    $scope.navtopostAd = function () {

        $window.location.assign('/postAd');

    }


});

ebay.controller('add_controller', function ($http, $scope, $window, $timeout) {





    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                console.log(response);
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });


    $scope.submit = function () {



            if ($scope.bid_enabled == 1)
                $scope.item_price = $scope.base_price;


            $http({
                method: "POST",
                url: "/addAd",
                data: {
                    "item_name": $scope.item_name,
                    "item_description": $scope.item_description,
                    "bid_enabled": $scope.bid_enabled,
                    "item_price": parseInt($scope.item_price),
                    "quantity": $scope.item_quantity
                }
            })
                .then(function success(response) {
                        var row_id = response.data.rowid;
                        console.log(response);
                        console.log(row_id);
                        $window.location.href = "/advertisements/" + row_id;
                    },
                    function error(response) {
                        $scope.invalid = true;
                        $timeout(function(){
                            $scope.invalid = false;
                        },2000);
                    })




    };

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

});

ebay.controller('home_controller', function ($scope, $http, $window, $timeout) {

    $scope.advertisements = [];
    $scope.user_name = '';

    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                console.log(response);
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });

    $http({

        method: "GET",
        url: "/getRecentAds"
    })
        .then(function success(response) {
                $scope.advertisements = response.data;
            },
            function error(response) {
                console.log(response);
            });

    $scope.search = function(){

        console.log($scope.searchString);

        $http({


            method:"POST",
            url: "/search",
            data: {"searchString": $scope.searchString}

        })
            .then(function success(response){
                    $scope.advertisements = response.data;
                },
                function error(err){
                    console.log(err);
                });
    };


    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

});

ebay.controller('cart_controller', function ($scope, $http, $window, $timeout) {

    // $scope.cart = [];
    $scope.total_before_shipping = 0;
    $scope.in_payment = false;
    $scope.payment_done = false;

    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                console.log(response);
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });


    ad_id = [];
    $http({
        method: 'GET',
        url: '/getCart'
    })
        .then(function success(data) {
                $scope.cart = data.data;
                console.log($scope.cart);
                if ($scope.cart.length == 0) {
                    $scope.cart_empty = true;
                    console.log($scope.cart_empty);
                }
                for (item in $scope.cart) {
                    $scope.total_before_shipping = $scope.total_before_shipping + (parseFloat($scope.cart[item].item_price) * parseFloat($scope.cart[item].item_quantity));
                }
                $scope.total = $scope.total_before_shipping + 5;

            },
            function error(err) {
                console.log(err);
            });


    $scope.pay = function () {

        $scope.in_payment = true;
        var cart_screen = angular.element(document.querySelector('#cart_Screen'));
        cart_screen.remove();
    };


    $scope.checkout = function () {


        $http({
            method: "POST",
            url: '/checkout',
            data: {"cart": $scope.cart}
        })
            .then(function success(data) {
                    console.log(data);
                    $scope.payment_done = true;
                    $timeout(function () {
                        $window.location.assign('/');
                    }, 3000)
                },
                function error(err) {
                    $scope.payment_failed = true;
                    $timeout(function () {
                        $window.location.reload();
                    }, 3000);
                    console.log(err);
                })


    };

    $scope.remove = function (cart_id) {

        console.log(cart_id);
        $http({
            method: "POST",
            url: '/removeFromCart',
            data: {"cart_id": cart_id}
        })
            .then(function success(data) {
                    $window.location.reload();
                },
                function error(err) {
                    $window.location.reload();
                    console.log(data);
                    console.log(err);
                })

    };

    $scope.edit = function (cart_id, edit, stock, current) {

        console.log(edit, stock, current);

        if(current == 1 && edit == -1){
            console.log('invalid');
            return;
        }

        if (current >= stock && edit == 1) {

            console.log('not enough stock');

        } else {

            $http({

                method: "POST",
                url: "/editCart",
                data: {"cart_id": cart_id, "item_quantity": edit}

            }).then(function success(data) {
                    $scope.item_quantity = $scope.item_quantity + edit;
                    $window.location.href = "/cart";
                },
                function error(err) {
                    console.log(err);
                })
        }

    };

    $scope.navtopostAd = function () {

        $window.location.assign('/postAd');

    };

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };


});

ebay.controller('order_history_controller', function ($scope, $http, $window, $timeout) {


    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                $http({
                    method: "GET",
                    url: "/fetchUserOrders/" + $scope.user_handle
                })
                    .then(function success(data) {
                        console.log(data);
                        $scope.orders = data.data;

                    }, function error(err) {
                        console.log(err);
                    })
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };


});

ebay.controller('bid_history_controller', function ($scope, $http, $window, $timeout) {


    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                $http({
                    method: "GET",
                    url: "/fetchUserBids/" + $scope.user_handle
                })
                    .then(function success(data) {
                        console.log(data);
                        $scope.bids = data.data;

                    }, function error(err) {
                        console.log(err);
                    })
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

});

ebay.controller('ad_history_controller', function ($scope, $http, $window, $timeout) {


    $http({

        method: "GET",
        url: "/identify"
    })
        .then(function success(response) {
                $scope.user_handle = response.data.handle;
                $scope.user_name = response.data.name;
                $http({
                    method: "GET",
                    url: "/fetchUserAds/" + $scope.user_handle
                })
                    .then(function success(data) {
                        console.log(data);
                        $scope.advertisements = data.data;

                    }, function error(err) {
                        console.log(err);
                    })
            },
            function error(err) {
                $scope.user_handle = 'Hi!';
                $scope.user_name = 'Hey!';
            });

    $scope.navtoCart = function () {

        $window.location.assign('/cart');

    };

    $scope.navtoRoot = function () {

        $window.location.assign('/');

    };

    $scope.navtosignout = function () {

        $window.location.assign('/signout');

    };

    $scope.navtomyorders = function () {

        $window.location.assign('/myOrders');

    };

    $scope.navtomybids = function () {

        $window.location.assign('/myBids');

    };

    $scope.navtomyads = function () {

        $window.location.assign('/myAds');

    };

    $scope.navtoprofile = function () {

        $window.location.assign('/profile/' + $scope.user_handle);
    };

});