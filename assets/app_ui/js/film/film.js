
  'use strict';

  angular.module('film', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.film', {
      url: '/f/{filmId}_{filmSlug}',
      title: 'Film',
      views: {
        'page' : {
          templateUrl: '/assets/templates/film.tmpl.html',
          controller: 'FilmCtrl'
        }
      },
      resolve: {
        FilmLoad: function($stateParams,filmApiService) {
         
          return filmApiService.getFilm($stateParams.filmId);
          
        }, 
      }
    });
  }])

  .controller('FilmCtrl', ['$scope', '$stateParams','me','FilmLoad',
    function ($scope,$stateParams,me,FilmLoad) {
            console.log($stateParams.filmId)
           $scope.film = FilmLoad.film;
           $scope.follower_reviews = FilmLoad.follower_reviews;
    }]) 

  
  ;
