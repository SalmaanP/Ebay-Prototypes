/**
 * Created by Salmaan on 10/2/2016.
 */

var ebay = angular.module('ebay', []);

ebay.controller('ebay_controller', function ($scope, $http, $window) {

    $scope.register = function () {

        var register_handle = $scope.register_handle;
        var register_email = $scope.register_email;
        var register_password = $scope.register_password;
        var register_fname = $scope.register_fname;
        var register_lname = $scope.register_lname;

        $http({
            method: 'POST',
            url: '/register',
            data: {
                'register_handle': register_handle,
                'register_email': register_email,
                'register_password': register_password,
                'register_fname': $scope.register_fname,
                'register_lname': $scope.register_lname
            }
        })
            .then(function success(response) {
                    console.log(response);
                    if (response.data.registered) {
                        $window.location.href = '/home';
                    }
                },
                function error(response) {
                    if (response.status == 400) {
                        console.log('lol');
                    }
                });


    };

    $scope.login = function () {


        var signin_handle = $scope.signin_handle;
        var signin_password = $scope.signin_password;

        $http({
            method: 'POST',
            url: '/signIn',
            data: {"signin_handle": signin_handle, "signin_password": signin_password}
        })
            .then(function success(data) {
                    if (data.data.authenticated) {
                        $window.location.href = '/home';
                    }
                },
                function error(data) {
                    if (data.status == 401) {

                    }
                })

    }

});