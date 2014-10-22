/*global _ */
/*global moment*/

'use strict';

var aeReview = angular.module('ae-review', [
    'vr.directives.slider',
    'Api',
    'ngAnimate',
    'siyfion.sfTypeahead',
    'ReviewService'
])


.controller('addReviewCtrl', ['$q','$scope', 'ratingTypesApiService', 'reviewApiService', 'msgBus','ReviewService',
    function($q,$scope, ratingTypesApiService, reviewApiService,msgBus, ReviewService) {
        
        $scope.hint_index = 0;
        var sortedReviews = [];
        $scope.show_hint = false;
        $scope.left = "";
        $scope.right = "";
        $scope.relation_top = window.event.clientY;
        $scope.ae_button_label = "Add";
        
        
        ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = results;
             
            })

        $scope.getReview = function(review_id)
        {
            if(typeof review_id === 'object'){
                console.log('didnt make api call');
                $scope.rating_types = review_id.rating_types;
                $scope.review = review_id.review;
            }else{
                ReviewService.getReview(review_id).then(function(results){
                    $scope.rating_types = results.rating_types;
                    $scope.review = results.review;
                })
            }

            

            $scope.ae_button_label = "Update";
        }
         
        msgBus.onMsg('review:new', function(event, data) {
            $scope.review = new reviewApiService();
            ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = results;
                console.log('new', results);
            })
            $scope.ae_button_label = "Add";
        }, $scope);

        msgBus.onMsg('review:edit', function(event, data) {
          console.log(data.id);
          $scope.getReview(data.id);
        }, $scope);

        //Pull the initial 50 to use in comparing
        reviewApiService
            .query({
                num: '50'
            }, function(response) {
                $scope.reviews = sortedReviews = response.results;

            });

        $scope.reviewSubmit = function() {
            //$scope.review.ratings = $scope.rating_types;
            var ratings = [];
            _.forEach($scope.rating_types, function(val){
                var rt = {
                    rating_type_id: val.id,
                    value:val.value
                }
                ratings.push(rt);
            });

            $scope.review.ratings = ratings;
            $scope.review.$save();

            $scope.review = new reviewApiService();
        }

        $scope.sliding = function() {

            inBetween();
        }

        $scope.setCurrent = function(el) {

            $scope.hint_index = el;

            $scope.show_hint = true;
            sortedReviews = _.sortBy($scope.reviews, function(r) {
                return r.ratings[$scope.hint_index] ? r.ratings[$scope.hint_index].value : 0;
            })
            $scope.relation_top = window.event.clientY  - 75;
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
                
                //skip everything if this rating doesn't exist
                if( r[i].ratings[$scope.hint_index] === undefined)
                {
                    $scope.right_compare = '';
                    $scope.left_compare = '';
                    continue;
                }
                    

                var next_val = i + 1;
                if (next_val > r.length - 1) next_val = r.length - 1;

                if ($scope.curValue > r[i].ratings[$scope.hint_index].value && $scope.curValue < r[next_val].ratings[$scope.hint_index].value) {
                    $scope.left_compare = r[i].film.title
                    $scope.right_compare = r[next_val].film.title;
                    //console.log(r[i].ratings[$scope.hint_index].value - r[next_val].ratings[$scope.hint_index].value );
                }

                //check if last
                if ($scope.curValue > r[$scope.reviews.length - 1].ratings[$scope.hint_index].value) {
                    $scope.left_compare = r[$scope.reviews.length - 1].film.title;
                    $scope.right_compare = '';
                }

                //check if first
                if ( angular.isDefined(r[0].ratings[$scope.hint_index]) && $scope.curValue < r[0].ratings[$scope.hint_index].value) {
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
