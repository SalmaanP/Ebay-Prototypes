/**
 * Created by Salmaan on 10/3/2016.
 */

var item = angular.module('item', [], function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

item.controller('item_controller', function ($scope, $http, $location, $window) {

    //$locationProvider.html5Mode(true);
    var ad_id = $location.path().split("/")[2] || "Unknown";


    $scope.addToCart = function () {

        var item_id = ad_id;
        var item_seller_handle = $scope.seller_handle;
        var item_quantity_added = $scope.item_quantity_added;
        var item_price = $scope.item_price;
        var bid_enabled = $scope.bid_enabled;
        var item_name = $scope.item_name;
        var item_description = $scope.item_description;

        $http({
            method: "POST",
            url: '/addToCart',
            data: {
                "item_id": item_id,
                "item_seller_handle": item_seller_handle,
                "item_quantity": item_quantity_added,
                "item_price": item_price,
                "bid_enabled": bid_enabled,
                "item_name": item_name,
                "item_description": item_description
            }
        })
            .then(function success(data) {
                    console.log(data);
                },
                function error(err) {
                    console.log(err);
                })
    };


    if (ad_id == "Unknown") {

        $window.location.href = '/home';

    } else {
        $http({
            method: 'GET',
            url: '/getAdDetail/' + ad_id
        })
            .success(function (data) {

                $scope.item_name = data.name;
                $scope.item_description = data.description;
                $scope.item_quantity = data.quantity;
                $scope.item_price = data.price;
                $scope.seller_handle = data.seller_handle;
                $scope.bid_enabled = data.bid_enabled;


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
});

