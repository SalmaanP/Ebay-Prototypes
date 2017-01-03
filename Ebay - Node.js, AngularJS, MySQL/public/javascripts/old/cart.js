/**
 * Created by Salmaan on 10/6/2016.
 */

var cart = angular.module('cart', []);

cart.controller('cart_controller', function($scope, $http){

    // $scope.cart = [];
    ad_id = [];
    $http({
        method: 'GET',
        url: '/getCart'
    })
        .then(function success(data){
            $scope.cart = data.data;
            console.log($scope.cart);

        },
        function error(err){
            console.log(err);
        });



    $scope.checkout = function(){

            $http({
                method: "POST",
                url: '/checkout',
                data: {"cart":$scope.cart}
            })
                .then(function success(data){
                    console.log(data);
                },
                function error(err){
                    console.log(err);
                })


    }


});