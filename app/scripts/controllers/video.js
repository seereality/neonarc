angular.module('weatherAppApp')
  .controller('VideosCtrl', function ($scope,$http,$location, getVideos) {

    getVideos.getVideos().then(function(data){
      console.log("videos data",data);
      $scope.videos = data.data;
    });

    $scope.deleteVideo = function(id){
      if(!confirm("press ok to delete"))
      return;

      getVideos.deleteVideo(id);
      getVideos.getVideos().then(function(data){
        console.log("videos data",data);
        $scope.videos = data.data;
      });
    }

  })
  .factory('getVideos',function($http,$rootScope,$cookies){
    return {
      nodeUrl:$rootScope.rootUrl+"/videos",
      getVideos:function(data){
        var url = this.nodeUrl;
        return $http({method:"GET",url:this.nodeUrl}).success(function(data){
          return data;
        }).error(function(err){
          return (err);
        });
      },
      
      deleteVideo : function(id){
        var url = $rootScope.rootUrl + '/videos/';
        $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        console.log("this is csrf token",$cookies.csrftoken);
        $http.defaults.headers['X-CSRFToken'] = $cookies.csrftoken;
        return $http({method:"DELETE",url:url+id}).success(function(data){
          return data
        }).error(function(err){
          return err;
        })
      }
    };
  })
