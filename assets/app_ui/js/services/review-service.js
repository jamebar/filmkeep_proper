'use strict';

angular.module('ReviewService', ['Api'])

.factory('ReviewService', [ '$q','ratingTypesApiService', 'reviewApiService', 'compareApiService',
    function ($q,ratingTypesApiService,reviewApiService, compareApiService) {

     
        function Review(){

        }

        var types_deferred = $q.defer();
        var reviews_deferred = $q.defer();
        var _types_data = null;

        ratingTypesApiService
            .query({}, function(response) {
                types_deferred.resolve(response.results);
             
            });

        reviewApiService
            .query({
                num: '50'
            }, function(response) {
                
                reviews_deferred.resolve(response.results);
                //console.log(_reviews);
            });

        Review.getRatingTypes = function(){
            return types_deferred.promise;
        }
        Review.setRatingTypes = function(types){
            types_deferred = $q.defer()
            types_deferred.resolve(types);
        }

        Review.getReviews = function(){
            return reviews_deferred.promise;
        }

        Review.getCompares = function(film_id){
            return compareApiService.getCompares(film_id);
        }

        Review.getReview = function(review_id)
        { 
            var deferred = $q.defer();
            reviewApiService
                .get({review_id:review_id},function(response) {
                
                    deferred.resolve(response);

                });
           

            //wait for review and rating_types to load, then assign the values from the review
            return $q.all({review: deferred.promise, rating_types: Review.getRatingTypes()})
              .then(function(results) {

                var rt = angular.copy(results.rating_types);
                var assigned_ratings = _.map(rt, function(val){
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

               
                return {
                    review: results.review,
                    rating_types: assigned_ratings
                }
                //$scope.ae_button_label = "Update";
            });

           
        }

        return Review;
    }


]);