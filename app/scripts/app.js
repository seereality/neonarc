'use strict';

/**
 * @ngdoc overview
 * @name weatherAppApp
 * @description
 * # weatherAppApp
 *
 * Main module of the application.
 */
angular
  .module('weatherAppApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'satellizer'
  ])
    /*.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/signin', {
            templateUrl: 'views/signIn.html',
            controller: 'SignCtrl'
        })
      .otherwise({
        redirectTo: '/'
      });
  })*/
    .config(function($stateProvider, $locationProvider, $httpProvider,$urlRouterProvider){
        $urlRouterProvider.otherwise('/');
        
        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope,$cookies){
          // Initialize a new promise
          var deferred = $q.defer();

          // Make an AJAX call to check if the user is logged in
          $http.get('/loggedin').success(function(user){
            // Authenticated
            if (user !== '0'){  
              $timeout(deferred.resolve, 0);
            }

            // Not Authenticated
            else {
              $rootScope  .message = 'You need to log in.';
              $timeout(function(){deferred.reject();}, 0);
              $location.url('/login');
            }
          });

          return deferred.promise;
        };

        //================================================
        
        //================================================
        // Add an interceptor for AJAX errors
        //================================================
        $httpProvider.responseInterceptors.push(function($q, $location) {
          return function(promise) {
            return promise.then(
              // Success: just return the response
              function(response){
                console.log("what this responseinterceptors do ",response);
                return response;
              }, 
              // Error: check the error status to get only the 401
              function(response) {
                if (response.status === 401)
                  $location.url('/login');
                return $q.reject(response);
              }
            );
          }
        });

        $stateProvider
            .state('main',{
                url:'/main',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve : {
                  loggedin : function(){
                    console.log("just making this as landing page modified")
                  }
                }
            })
            .state('signin',{
                url:'/signin',
                templateUrl: 'views/signin.html',
                controller: 'SignInCtrl'
            })
            .state('login',{
                url:'/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('loginSuccess',{
                url:'/',
                templateUrl: 'views/loginsuccess.html',
                controller: 'LoginCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('videos',{
              url : '/videos',
              templateUrl:'views/videoslist.html',
              controller:'VideosCtrl',
              resolve: {
                    loggedin: checkLoggedin
                }
            });
    })
    .run(function($http,$cookies,$rootScope){
      $rootScope.rootUrl = "http://localhost:3000"
      $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
      console.log("this is csrf token afa",$cookies.csrftoken);
      $http.defaults.headers['X-CSRFToken'] = $cookies.csrftoken;  
    });
