
  'use strict';

  angular.module('review', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('hello', {
      url: '/r/{reviewId}',
      title: 'Review',
      views: {
        'page' : {
          templateUrl: 'assets/templates/review.tmpl.html',
          controller: 'ReviewCtrl'
        }
      }
    });
  }])

  .controller('ReviewCtrl', ['$scope', '$stateParams','ReviewService',
    function ($scope,$stateParams,ReviewService) {

         ReviewService.getReview($stateParams.reviewId).then(function(results){
                $scope.rating_types = results.rating_types;
                $scope.review = results.review;
            });

            $scope.toPercent = function(num){
                return num/2000 * 100;
            }
     

    }]) 

  
  ;
