'use strict';
/**
 * Created by venkat on 4/12/14.
 */
angular.module('weatherAppApp')
//        $scope.city = "";
    .controller('SignInCtrl', function ($scope,$http,$location, addUser) {
        console.log("in dot square");
        $scope.signIn = function(model,form){
          console.log(model,form);
            console.log("model,form");
            addUser.addUser(form).then(function(data){
                console.log(data);
                if(data.status === 200 && data.statusText === "OK"){
                    $location.path("/");
                }
            },function(err){
                console.log(err);
            })

        };
    })
    
