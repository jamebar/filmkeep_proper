
  'use strict';

  angular.module('review', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('review', {
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

  .controller('ReviewCtrl', ['$scope', '$stateParams','ReviewService','ReviewLoad',
    function ($scope,$stateParams,ReviewService,ReviewLoad) {

            $scope.rating_types = ReviewLoad.rating_types;
            ReviewLoad.review.backdrop = $scope.imageService.backdrop(ReviewLoad.review.film.backdrop_path,1);
            $scope.review = ReviewLoad.review;
            

            $scope.toPercent = function(num){
                return num/2000 * 100;
            }
     

    }]) 

  
  ;
