'use strict';
console.log('Spencer Made With Heart，点个赞吧亲');
console.log('源代码：http://github.com/sepmein/class4');

angular.module('class4App')
    .controller('MainCtrl', ['$scope', '$firebase', '$cookies', 'FBURL',
        function ($scope, $firebase, $cookies, FBURL) {
            $scope.init = function () {
                //1. link to firebase
                var class4Ref = new Firebase(FBURL);
                $scope.class4 = $firebase(class4Ref);
                //bind event listener
                $scope.class4.$on('loaded', function () {
                    $scope.loaded = true;
//                    console.log($scope.class4);
                    $scope.showMarker();

                    if (!$scope.anonymous() && $scope.locationMissing()) {
                        $scope.editMode = true;
                        $scope.map.on('click', $scope.submitAddress);
                    } else {
                        $scope.editMode = false;
                    }
                });

                //2. check cookies
                $scope.anonymous = function () {
                    return !($cookies.id && $cookies.user);
                };
                //3. 有用户名，但未输入地址
                $scope.locationMissing = function () {
                    if ($scope.anonymous()) {
                        return true;
                    } else {
                        return (!!$scope.userRef && !$scope.userRef.location);
                    }
                };
                if (!$scope.anonymous()) {
                    //old user, fetch data from firebase
                    $scope.id = $cookies.id;
                    $scope.user = $cookies.user;
//                    if($cookies.uid) $scope.uid = $cookies.uid;
                    $scope.userRef = $scope.class4.$child($scope.id);
                }

                //3. add leaflet map
                if (!$scope.map) {
                    $scope.map = L.map('map').setView([31.2292, 121.4437], 11);
                    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo($scope.map);

                }

                $scope.class4.$on('change', function () {
                    $scope.updateMarker();
                });

                $scope.markers = [];


            };

            $scope.init();

            //add user
            $scope.addUser = function () {
                //add to cookie
                $cookies.user = $scope.user;
//                $cookies.uid = $scope.uid;

                var userInfo = {
                    user: $scope.user
//                    uid: $scope.uid
                };

                //search firebase for exist info
                var newUser = true;
                for (var key in $scope.class4) {
                    if (angular.isObject($scope.class4[key]) && $scope.class4[key].user === $scope.user) {
//                  not new user
                        $cookies.id = $scope.id = key;
                        console.log($scope.user);
                        console.log(key);
                        newUser = false;
//                  换人的时候要更新fb ref，否则会出错
                        $scope.userRef = $scope.class4.$child(key);

                        if ($scope.locationMissing()) {
                            $scope.editMode = true;
                        }
                    }
                }

                //if is new user, add user info to firebase
                if (newUser) {
                    $scope.class4.$add(userInfo)
                        .then(function (ref) {
                            $scope.userRef = $scope.class4.$child(ref.name());
                            $cookies.user = $scope.user = $scope.userRef.user;
                            $cookies.id = $scope.id = ref.name();
                            $scope.map.on('click', $scope.submitAddress);
                            $scope.editMode = true;
                        });
                }
            };

            $scope.switchEditMode = function () {
                $scope.editMode = !$scope.editMode;
                if ($scope.editMode) {
                    $scope.map.on('click', $scope.submitAddress);
                } else {
                    $scope.map.off('click', $scope.submitAddress);
                }
            };

            $scope.editBtn = function () {
                if ($scope.editMode) {
                    return '完成';
                } else {
                    return '修改位置';
                }
            };
            $scope.editBtnClass = function () {
                if ($scope.editMode) {
                    return 'btn-danger';
                } else {
                    return 'btn-default';
                }
            };
            $scope.isAlone = function () {
                var keys = $scope.class4.$getIndex();
//                console.log(keys);
                if (keys.length <= 1) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.logout = function () {
                delete $cookies.id;
                delete $cookies.user;
                $scope.id = undefined;
                $scope.user = undefined;
                $scope.userRef = undefined;
            };

            //submit address to firebase
            $scope.submitAddress = function (e) {
                var latlng = e.latlng;
                $scope.userRef.$child('location').$set([latlng.lat, latlng.lng]);
            };

            $scope.addMarker = function (key) {
                if ($scope.class4[key].location) {
                    var marker;
                    if (key === $scope.id) {
                        // if is him self, use red icon
                        marker = L.marker($scope.class4[key].location,
                            {
                                zIndexOffset: 1000,
                                icon: L.icon({
                                    iconUrl: 'images/map-marker-red.png',
                                    iconRetinaUrl: 'images/map-marker-red-retina.png',
                                    iconSize: [42, 42],
                                    iconAnchor: [21, 42],
                                    shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.7.2/images/marker-shadow.png',
                                    shadowRetinaUrl: 'http://cdn.leafletjs.com/leaflet-0.7.2/images/marker-shadow@2x.png',
                                    shadowSize: [41, 41],
                                    shadowAnchor: [12, 42]

                                })
                            });
                        marker.bindPopup('<h6>你</h6>', {
                            offset: L.point(2, -29)
                        });
                    } else {
                        //else use default icon
                        marker = L.marker($scope.class4[key].location,
                            {
                                icon: L.icon({
                                    iconUrl: 'images/map-marker-default.png',
                                    iconRetinaUrl: 'images/map-marker-default-retina.png',
                                    iconSize: [42, 42],
                                    iconAnchor: [21, 42],
                                    shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.7.2/images/marker-shadow.png',
                                    shadowRetinaUrl: 'http://cdn.leafletjs.com/leaflet-0.7.2/images/marker-shadow@2x.png',
                                    shadowSize: [41, 41],
                                    shadowAnchor: [12, 42]
                                })
                            });
                        marker.bindPopup('<h6>' + $scope.class4[key].user + '</h6>', {
                            offset: L.point(2, -29)
                        });
                    }

                    marker.addTo($scope.map);
                    $scope.markers.push({
                        id: key,
                        marker: marker,
                        location: $scope.class4[key].location
                    });
                }
            };

            $scope.showMarker = function () {

                var keys = $scope.class4.$getIndex();
                angular.forEach(keys, function (key) {
//                    console.log($scope.map);
                    $scope.addMarker(key);
                });
            };

            $scope.updateMarker = function () {

//              如果还没有此marker，添加该marker至地图
                var keys = $scope.class4.$getIndex();
                angular.forEach(keys, function (key) {
                    var matched = false;
                    angular.forEach($scope.markers, function (k) {
//                        console.log(key, k.id);
                        if (key === k.id) {
                            matched = true;
                        }
                    });
                    if (!matched) {
                        $scope.addMarker(key);
                    }
                });
//              如果有，更新它的位置
                angular.forEach($scope.markers, function (key) {
//                    console.log(key);
                    key.marker.setLatLng($scope.class4[key.id].location);
                    key.marker.update();
                });
            };
        }]);
