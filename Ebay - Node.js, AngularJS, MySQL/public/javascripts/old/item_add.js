/**
 * Created by Salmaan on 10/3/2016.
 */

var item_add = angular.module('item_add', []);

item_add.controller('add_controller', function ($http, $scope, $window) {




    $scope.submit = function () {

        if($scope.bid_enabled == 1)
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
            .then(function success(response){
                var row_id = response.data.rowid;
                console.log(response);
                console.log(row_id);
                $window.location.href = "/advertisements/" + row_id;
            },
            function error(response){
                console.log(response);
            })

    }

});