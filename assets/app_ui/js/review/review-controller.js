
  'use strict';

  angular.module('review', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.review', {
      url: '/r/{reviewId}',
      title: 'Review',
      views: {
        'page' : {
          templateUrl: '/assets/templates/review.tmpl.html',
          controller: 'ReviewCtrl'
        }
      },
      resolve: {
        ReviewLoad: function($stateParams,ReviewService) {
         
          return ReviewService.getReview($stateParams.reviewId)
          
        }, 
      }
    });
  }])

  .controller('ReviewCtrl', ['$scope','msgBus','$rootScope', '$stateParams','ReviewService','ReviewLoad','me',
    function ($scope,msgBus,$rootScope,$stateParams,ReviewService,ReviewLoad,me) {
            msgBus.emitMsg('pagetitle::change', "Review: " +  ReviewLoad.review.film.title );
            $scope.rating_types = ReviewLoad.rating_types;
            $scope.review = ReviewLoad.review;
            $scope.me = me;
            
            // console.log($scope.review);
            $scope.toPercent = function(num){
                return (num/2000 * 100) + '%';
            }

            $scope.$on('watchlist::addremove', function(event, film_id) {

              $scope.review.film.on_watchlist = $scope.review.film.on_watchlist === 'true' ? 'false' : 'true';
                    
            });

            $rootScope.$on('review::updated',function(e,review){
              ReviewService.getReview($stateParams.reviewId).then(function(response){
                $scope.rating_types = response.rating_types;
                $scope.review = response.review;
              })
            })


    }]) 

  
  ;
