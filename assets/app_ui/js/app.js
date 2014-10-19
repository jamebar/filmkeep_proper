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
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.controller('addReviewCtrl', ['$q','$scope', 'ratingTypesApiService', 'reviewApiService',
    function($q,$scope, ratingTypesApiService, reviewApiService) {
        $scope.hint_index = 0;
        var sortedReviews = [];
        $scope.curValue = 1000;
        $scope.show_hint = false;
        $scope.left = "";
        $scope.right = "";
        $scope.relation_top = window.event.clientY;
        var review_deferred = $q.defer(),
            review_promise = review_deferred.promise,
            rating_types_deferred = $q.defer(),
            rating_types_promise = rating_types_deferred.promise;
        
        //wait for review and rating_types to load, then assign the values from the review
        $q.all({review:review_promise, rating_types:rating_types_promise})
          .then(function(results) {

            var assigned_ratings = _.map(results.rating_types, function(val){
                var ratings = results.review.ratings;
                var match = _.find(ratings, function(r){
                    return r.rating_type_id === val.id;
                });

                if(match){
                    val.value = match.value;
                   
                }
                else{
                    val.value = 1000;
                    val.new = true;
                }
                

                return val;

            });

            $scope.rating_types = assigned_ratings;
            $scope.review = results.review;
        });

        reviewApiService
            .get({review_id:283},function(response) {
                
                review_deferred.resolve(response);

            });

        ratingTypesApiService
            .query({user_id:1}, function(response) {
                rating_types_deferred.resolve(response.results);
            });

        reviewApiService
            .query({
                num: '50'
            }, function(response) {
                $scope.reviews = sortedReviews = response.results;

            });

        $scope.reviewSubmit = function() {
            $scope.review.ratings = $scope.rating_types;
            console.log('review', $scope.review);
        }

        $scope.sliding = function() {

            inBetween();
        }

        $scope.setCurrent = function(el) {

            $scope.hint_index = el;

            $scope.show_hint = true;
            sortedReviews = _.sortBy($scope.reviews, function(r) {
                return r.ratings[$scope.hint_index].value;
            })
            $scope.relation_top = window.event.clientY + document.body.scrollTop - 50;

            inBetween();
            $scope.fade_slider = true;
        }

        $scope.hideHint = function(el) {
            $scope.show_hint = false;
            $scope.fade_slider = false;
        }

        function inBetween() {
            $scope.curValue = $scope.rating_types[$scope.hint_index].value;
            var r = sortedReviews;
            for (var i = 0; i < $scope.reviews.length; i++) {
                var next_val = i + 1;
                if (next_val > r.length - 1) next_val = r.length - 1;

                if ($scope.curValue > r[i].ratings[$scope.hint_index].value && $scope.curValue < r[next_val].ratings[$scope.hint_index].value) {
                    $scope.left_compare = r[i].film.title
                    $scope.right_compare = r[next_val].film.title;
                }

                //check if last
                if ($scope.curValue > r[$scope.reviews.length - 1].ratings[$scope.hint_index].value) {
                    $scope.left_compare = r[$scope.reviews.length - 1].film.title;
                    $scope.right_compare = '';
                }

                //check if first
                if ($scope.curValue < r[0].ratings[$scope.hint_index].value) {
                    $scope.left_compare = '';
                    $scope.right_compare = r[0].film.title;
                }
            }
        }

        // Instantiate the bloodhound suggestion engine
        var films = new Bloodhound({
            datumTokenizer: function(d) {
                return Bloodhound.tokenizers.whitespace(title);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: '/api/tmdb/%QUERY',
                filter: function(list) {
                    return $.map(list.results, function(data) {
                        return {
                            title: data.title + " (" + data.release_date.substring(0, 4) + ")",
                            tmdb_id: data.id
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
            name: 'films',
            displayKey: 'title',
            source: films.ttAdapter()
        };

        $scope.$on('typeahead:selected', function(a, b) {
            console.log("a", a, "b", b, "review", $scope.review);
        })

    }
])

.directive('relationHint', ['$compile', '$timeout',
    function($compile, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/relation_hint.tmpl.html',
            link: function(scope, element, attrs) {


            }
        }
    }
])

;