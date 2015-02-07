'use strict';

/**
 * @ngdoc function
 * @name weatherAppApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dotSq
 */
angular.module('weatherAppApp')
//        $scope.city = "";
    .controller('MainCtrl', function () {
        console.log("in dot square");

    })
    .directive('slider',function(){
        return {
            restrict:'E',
            scope:{
                list:'='
            },
            controller:function($scope){
                this.toggleIsActiveClass = function(){
                    $scope.isActiveClass = !$scope.isActiveClass;
                };
            },
            template:'<aside style="background: #f5f5f5">' +
                    '<ul>' +
                    '<li ng-repeat="x in list"><a href="">{{x}}</a></li>' +
                    '</ul></aside>',
            transclude:true,
            link:function(scope,ele,attr){

            }
        };
    })
    .directive('hamberger',function(){
        return {
            restrict:'EA',
            template:'<div id="nav-toggle" ng-click="setClass()" ng-class="isActiveClass ? \'active\':\'\'"><span></span></div>',
            controller:function($scope){
                $scope.isActiveClass = false;
                $scope.setClass = function(){
                    $scope.isActiveClass = !$scope.isActiveClass;
                };
            },
            link:function(scope,attr,ele,slider){
            }
        };
    })
    .directive('mySlider',function(){
        return {
            restrict:'E',
            template:'<hamberger></hamberger>' +
                '<slider list="lists" ng-class="isActiveClass ? \'\':\'show-aside\'" ></slider>',
            link:function(){
                console.log("in my-slider dir");
            }
        };
    });

