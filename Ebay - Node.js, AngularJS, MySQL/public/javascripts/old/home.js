/**
 * Created by Salmaan on 10/4/2016.
 */

var home = angular.module('home', []);

home.controller('home_controller', function ($scope, $http) {

    $scope.advertisements = [];

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

});