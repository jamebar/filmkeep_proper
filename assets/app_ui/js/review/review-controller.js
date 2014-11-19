
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

  .controller('ReviewCtrl', ['$scope', '$stateParams','ReviewService','ReviewLoad','me',
    function ($scope,$stateParams,ReviewService,ReviewLoad,me) {

            $scope.rating_types = ReviewLoad.rating_types;
            $scope.review = ReviewLoad.review;
            $scope.me = me;
            // console.log($scope.review);
            $scope.toPercent = function(num){
                return num/2000 * 100;
            }
    }]) 

  
  ;
