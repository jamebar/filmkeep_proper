
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
      
    });
  }])

  .controller('WatchlistCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','Api','page_user',
    function ($scope,msgBus, $stateParams, ReviewService, Api,page_user) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Watchlist" );

        Api.getWatchlist(page_user.id).then(function(response) {

                $scope.watchlist_items = response.results;
            });

        $scope.htoggle = false;
        

    }]) 

  
  ;
