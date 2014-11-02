
  'use strict';

  angular.module('filmkeep', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('filmkeep', {
      url: '/fk/{username}',
      title: 'filmkeep',
      views: {
        'page' : {
          templateUrl: 'assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      }
    });
  }])

  .controller('FilmkeepCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService',
    function ($scope,$stateParams,ReviewService,userApiService,reviewApiService) {

        userApiService
            .get({user_id:$stateParams.username},function(response) {
            
                $scope.user = response;

            });

        reviewApiService
            .query({
                num: '10',
                user_id:5
            }, function(response) {
                
                $scope.user_reviews = response.results;
                //console.log(_reviews);
            });

    }]) 

  
  ;
