
  'use strict';

  angular.module('watchlist', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.user.watchlist', {
      url: '/watchlist',
      title: 'watchlist',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/watchlist.tmpl.html',
          controller: 'WatchlistCtrl'
        }
      },
      resolve: {
        page_user: function(userApiService, $stateParams, $q){
          var deferred = $q.defer();
          userApiService
            .get({user_id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);
            });
          return deferred.promise;
        }
      }
    });
  }])

  .controller('WatchlistCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','watchlistApiService','followerFactory','me','page_user',
    function ($scope, $stateParams, ReviewService, userApiService, reviewApiService, followApiService, watchlistApiService, followerFactory,  me, page_user) {
    
        watchlistApiService
            .getWatchlist(page_user.id).then(function(response) {

                $scope.watchlist_items = response.results;
                
            });
        

    }]) 

  
  ;
