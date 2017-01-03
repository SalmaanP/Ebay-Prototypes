/**
 * Created by Salmaan on 10/5/2016.
 */

var profile = angular.module('profile', [], function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

});

profile.controller('profile_controller', function ($scope, $http, $window, $location) {

    var handle = $location.path().split("/")[2] || "Unknown";
    if (handle == "Unknown") {

        $window.location.href = '/home';

    } else {

        getSellerInfo($http, $scope, handle);

        fetchUserOrders($http, handle);

        fetchUserAds($http, handle);


    }

});

function getSellerInfo($http, $scope, handle){

    $http({
        method: "GET",
        url: '/getSellerInfo/' + handle
    })
        .then(function success(data) {
                $scope.fname = data.data.first_name;
                $scope.lname = data.data.last_name;
                $scope.id = data.data.number;
                $scope.city = data.data.city;
                $scope.country = data.data.country;
                $scope.handle = data.data.handle;
                $scope.dob = data.data.birthday;
            },
            function error(err) {
                console.log(err);
            });

}

function fetchUserOrders($http, handle){

    $http({
        method: "GET",
        url : '/fetchUserOrders/' + handle
    })
        .then(function success(data){
                console.log(data);
            },
            function error(err){
                console.log(err);
            });

}

function fetchUserAds($http, handle){


    $http({
        method: "GET",
        url : '/fetchUserAds/' + handle
    })
        .then(function success(data){
                console.log(data);
            },
            function error(err){
                console.log(err);
            })

}