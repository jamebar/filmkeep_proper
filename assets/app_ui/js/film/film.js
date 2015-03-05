
  'use strict';

  angular.module('film', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.film', {
      url: '/f/{filmId}_{filmSlug}',
      title: 'Film',
      views: {
        'page' : {
          templateUrl: '/assets/templates/film.tmpl.html?cache=1',
          controller: 'FilmCtrl'
        }
      },
      resolve: {
        FilmLoad:['$stateParams','Api', function($stateParams,Api) {
          return Api.getFilm($stateParams.filmId);
        }], 
      }
    });
  }])

  .controller('FilmCtrl', ['$scope', 'msgBus','$stateParams','me','FilmLoad',
    function ($scope,msgBus,$stateParams,me,FilmLoad) {
        msgBus.emitMsg('pagetitle::change', FilmLoad.film.title );
        $scope.me = me;
        FilmLoad.film.film_id = FilmLoad.film.id;
        $scope.film = FilmLoad.film;
        $scope.follower_reviews = FilmLoad.follower_reviews;

        $scope.$on('watchlist::addremove', function(event, film_id) {

          $scope.film.on_watchlist = $scope.film.on_watchlist === 'true' ? 'false' : 'true';
                
        });

    }]) 

  
  ;
