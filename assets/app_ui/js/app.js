/*global _ */
/*global moment*/

'use strict';

angular.module('myApp', [
    'ui.router',
    'ui.bootstrap',
    'vr.directives.slider',
    'Api',
    'ngAnimate',
    'siyfion.sfTypeahead'
    ], function($interpolateProvider){
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.controller('addReviewCtrl', ['$scope','ratingTypesApiService','reviewApiService',
        function($scope, ratingTypesApiService, reviewApiService) {
            $scope.hint_index = 0;
            var sortedReviews = [];
            $scope.curValue = 1000;
            $scope.show_hint = false;
            $scope.left = "";
            $scope.right = "";
            $scope.relation_top = window.event.clientY;
            $scope.review = {};


            ratingTypesApiService
                .query(function(response){
                    $scope.rating_types = response.results;

                });

            reviewApiService
                .query({num:'50'}, function(response){
                    $scope.reviews = sortedReviews = response.results;
                    
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
                        $scope.left_compare = r[i].film.title
                        $scope.right_compare = r[next_val].film.title;
                    }
                }
            }

            $scope.setCurrent = function(el){
 
                $scope.hint_index = el;
                $scope.show_hint = true;
                sortedReviews = _.sortBy($scope.reviews, function(r){
                    return r.ratings[$scope.hint_index].value;
                })
                $scope.relation_top = window.event.clientY + document.body.scrollTop -200;
                $scope.fade_slider = true;

            }

            $scope.hideHint = function(el){
                $scope.show_hint = false;
                $scope.fade_slider = false;
            }


            // Instantiate the bloodhound suggestion engine
          var films = new Bloodhound({
            datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(value); },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: '/api/tmdb/%QUERY',
                filter: function(list) {
                    return $.map(list.results, function(data) {
                        return {
                            value: data.title + " (" + data.release_date.substring(0,4) + ")",
                            id:data.id
                        };
                    });
                }
            }
          });

          films.initialize();

          $scope.typeaheadOptions = {
            hint: true,
            highlight: true,
            minLength: 1,
          };

          $scope.typeaheadData = {
            name:'films',
            displayKey: 'value',
            source: films.ttAdapter()
          };

          $scope.$on('typeahead:selected', function(a,b){
            console.log("a", a, "b", b, "review", $scope.review);
          })
     
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


