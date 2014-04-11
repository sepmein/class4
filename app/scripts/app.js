'use strict';

angular.module('class4App', [
    'ngCookies',
    'ngRoute',
    'firebase'
])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .constant('FBURL', 'https://class4.firebaseIO.com');