/*global _ */
/*global moment*/

'use strict';

angular.module('myApp', [
    'ui.router',
    'vr.directives.slider',
    'Api'
    ], function($interpolateProvider){
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.controller('addReviewCtrl', ['$scope','ratingTypesApiService','reviewApiService',
        function($scope, ratingTypesApiService, reviewApiService) {
            $scope.hint_index = 0;
            var sortedReviews = [];
            $scope.curValue = 1000;
            $scope.left = "";
            $scope.right = "";
            ratingTypesApiService
                .query(function(response){
                    $scope.rating_types = response.results;

                });

            reviewApiService
                .query({num:'50'}, function(response){
                    $scope.reviews =sortedReviews= response.results;
                    
                });

            

            $scope.sliding = function(){
                $scope.curValue = $scope.rating_types[$scope.hint_index].value;
                var r = sortedReviews;
                for(var i = 0;i<$scope.reviews.length;i++)
                {
                    
                    var next_val = i + 1;
                    if(next_val > r.length-1) next_val = r.length-1;

                    if($scope.curValue > r[i].ratings[$scope.hint_index].value && $scope.curValue < r[next_val].ratings[$scope.hint_index].value)
                    {
                        $scope.left = r[i].film.title
                        $scope.right = r[next_val].film.title;
                    }
                    
                }
            }

            $scope.setCurrent = function(el){
                $scope.hint_index = el.rating_type.sort_order - 1;
                sortedReviews = _.sortBy($scope.reviews, function(r){
                    return r.ratings[$scope.hint_index].value;
                })

            }
     
        }
])

.directive('relationHint', [ '$compile','$timeout',
    function(   $compile, $timeout){
        return {
          restrict: 'E',
          templateUrl: 'assets/templates/relation_hint.tmpl.html',
          link: function(scope, element, attrs) {

           
          }
      }
}])

;


