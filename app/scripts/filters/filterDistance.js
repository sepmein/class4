/**
 * Created by Spencer on 14-4-10.
 */
'use strict';

angular.module('class4App')
    .filter('computeDistance', function () {
        return function (input, userRef) {
//            console.log(userRef);
//            console.log('input', input);
            var userLocation = L.latLng(userRef.location);
            angular.forEach(input, function (value, index) {
                if (value.$id !== userRef.$id) {
                    value.distance = userLocation.distanceTo(L.latLng(value.location));
                } else {
                    input.splice(index, 1);
                }
            });
//            console.log(returnArray);
            return input;
        };
    })
    .filter('meters', function () {
        return function (input) {
            var rounded = Math.round(input * 10) / 10;
            if (input <= 1000) {
                return rounded + 'm';
            } else {
                return Math.round(rounded / 100) / 10 + 'km';
            }
        };
    })
    .filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });