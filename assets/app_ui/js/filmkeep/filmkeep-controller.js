
  'use strict';

  angular.module('filmkeep', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('filmkeep', {
      url: '/fk/{username}',
      title: 'filmkeep',
      views: {
        'page' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      }
    });
  }])

  .controller('FilmkeepCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','imageService',
    function ($scope,$stateParams,ReviewService,userApiService,reviewApiService,imageService) {

        userApiService
            .get({user_id:$stateParams.username,username:true},function(response) {
            
                $scope.page_user = response;

            });

        reviewApiService
            .query({
                num: '10',
                username:$stateParams.username
            }, function(response) {
                
                $scope.user_reviews = _.map(response.results, function(r){ 
                  r.poster = $scope.imageService.poster(r.film.poster_path,1);
                  return r;
                });
                
            });

    }]) 

  
  ;
