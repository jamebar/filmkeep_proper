/*global _ */
/*global moment*/

'use strict';

angular.module('myApp', [
    'ui.router',
    'ui.bootstrap',
    'vr.directives.slider',
    'Api',
    'ngAnimate',
    'siyfion.sfTypeahead',
    'ae-review',
    'review',
    'filmkeep',
    'feed',
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider', function($locationProvider) {

  $locationProvider.html5Mode(true);

}])

.controller('appCtrl', ['$scope','msgBus','$modal','ReviewService','$timeout','reviewApiService','imageService',
    function($scope,msgBus,$modal,ReviewService,$timeout,reviewApiService, imageService) {
        $scope.imageService = imageService;
        $scope.review_new = new reviewApiService();
        ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types_new = results;
                
            });

        $scope.getReview = function(review) {
            if (typeof review === 'object') {
                console.log('didnt make api call');
                $scope.review = review.review;
                $scope.rating_types = review.rating_types;
                showModal();

            } else {
                ReviewService.getReview(review).then(function(results) {
                   // console.log(results);
                    $scope.review = results.review;
                    $scope.rating_types = results.rating_types;
                    showModal();

                })
            }

            $scope.ae_button_label = "Update";
        }

        function showModal(){
            var modalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_review.tmpl.html',
          
            });
        }
        

        $scope.editReview = function(id){
            $scope.getReview(id);
            //openModal(id);

        }

        $scope.newReview = function(){
   
            $scope.review = new reviewApiService();
            ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = results;
                
            });
            showModal();
            
                
        }

        // function openModal(id){
        //     var modalInstance = $modal.open({
        //         templateUrl: 'assets/templates/add_review.tmpl.html',
              
        //     });

        //     modalInstance.opened.then(function () {
               
        //       if(id){
        //         setTimeout(function(){
        //             msgBus.emitMsg('review:edit', {'id': id});
        //         },500);
               
        //       }
        //       else
        //       {
        //         msgBus.emitMsg('review:new');
        //       }
        //     }, function () {
             
        //     });
        // }
        
    }
])

.factory('imageService', [ function() {
    var image_config = image_path_config;

    var images = {};
    
    images.backdrop = function(path,size){
      var s = size || 0;
      return image_config.images.base_url + image_config.images.backdrop_sizes[s] +  path
    }

    images.poster = function(path,size){
      var s = size || 0;
      return image_config.images.base_url + image_config.images.poster_sizes[s] +  path
    }

    return images;
}])


.factory('msgBus', ['$rootScope', function($rootScope) {
    var msgBus = {};
    msgBus.emitMsg = function(msg, data) {
        data = data || {}
        $rootScope.$emit(msg, data);
    };
    msgBus.onMsg = function(msg, func, scope) {
        var unbind = $rootScope.$on(msg, func);
        if (scope) {
            scope.$on('$destroy', unbind);
        }
    };
    return msgBus;
}])
;
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


.controller('addReviewCtrl', ['$q', '$scope', 'ratingTypesApiService', 'reviewApiService', 'msgBus', 'ReviewService',
    function($q, $scope, ratingTypesApiService, reviewApiService, msgBus, ReviewService) {

        

        // msgBus.onMsg('review:new', function(event, data) {
        //     $scope.review = new reviewApiService();
        //     ReviewService.getRatingTypes().then(function(results){
        //         $scope.rating_types = results;
        //         console.log('new', results);
        //     })
        //     $scope.ae_button_label = "Add";
        // }, $scope);

        // msgBus.onMsg('review:edit', function(event, data) {
        //   console.log(data.id);
        //   $scope.getReview(data.id);
        // }, $scope);





    }
])
.directive('addEditReview', ['$document','$compile','$timeout','ratingTypesApiService', 'reviewApiService', 'msgBus','ReviewService',
    function($document,$compile,$timeout,ratingTypesApiService, reviewApiService,msgBus, ReviewService){
        return {
            restrict: 'E',
            scope:{
                review : '=',
                rating_types: '=ratingTypes'
            },
            templateUrl: '/assets/templates/add_review.tmpl.html',
            link: function(scope, element, attrs) {

                scope.hint_index = 0;
                var sortedReviews = [];
                scope.show_hint = false;
                scope.left = "";
                scope.right = "";
                scope.relation_top = window.event.clientY;
                scope.ae_button_label = scope.review.id ? "Update" : "Add";
                
                
                ReviewService.getReviews().then(function(results){
                        scope.reviews = results;
                    })

                
                scope.reviewSubmit = function() {
                    //scope.review.ratings = scope.rating_types;
                    var ratings = [];
                    _.forEach(scope.rating_types, function(val){
                        var rt = {
                            rating_type_id: val.id,
                            value:val.value
                        }
                        ratings.push(rt);
                    });

                    scope.review.ratings = ratings;

                    if(scope.review.id)
                      scope.review.$update({review_id:scope.review.id});
                    else
                      scope.review.$save();

                    // var newReview = new reviewApiService();
                    // newReview
                    // scope.review = new reviewApiService();
                }

                scope.sliding = function() {

                    inBetween();
                }

                scope.setCurrent = function(el) {
                    //console.log('hint_index',el);
                    scope.hint_index = el;

                    scope.show_hint = true;
                    sortedReviews = _.sortBy(scope.reviews, function(r) {
                        return r.ratings[scope.hint_index] ? r.ratings[scope.hint_index].value : 0;
                    })
                    // console.log(window.event.clientY);
                    //el.getBoundingClientRect();
                    scope.relation_top = window.event.clientY ;
                    // console.log(scope.relation_top);
                    inBetween();
                    scope.fade_slider = true;
                }

                scope.hideHint = function(el) {
                    scope.show_hint = false;
                    scope.fade_slider = false;
                }

                function getOffsetTop( elem )
                {
                    var offsetTop = 0;
                    do {
                      if ( !isNaN( elem.offsetTop ) )
                      {
                          offsetLeft += elem.offsetTop;
                      }
                    } while( elem = elem.offsetParent );
                    return offsetTop;
                }

                function inBetween() {
                    // console.log(scope.ratingTypes);
                    // console.log(scope.ratingTypes[scope.hint_index]);
                   
                    scope.curValue = scope.rating_types[scope.hint_index].value;
                    //console.log(scope.review.assigned_ratings[scope.hint_index].value);
                    var r = sortedReviews;
                    for (var i = 0; i < r.length; i++) {
                        
                        //skip everything if this rating doesn't exist
                        if( r[i].ratings[scope.hint_index] === undefined)
                        {
                            scope.right_compare = '';
                            scope.left_compare = '';
                            continue;
                        }
                            

                        var next_val = i + 1;
                        if (next_val > r.length - 1) next_val = r.length - 1;

                        if (scope.curValue > r[i].ratings[scope.hint_index].value && scope.curValue < r[next_val].ratings[scope.hint_index].value) {
                            scope.left_compare = r[i].film.title
                            scope.right_compare = r[next_val].film.title;
                            //console.log(r[i].ratings[scope.hint_index].value - r[next_val].ratings[scope.hint_index].value );
                        }

                        //check if last
                        if (scope.curValue > r[r.length - 1].ratings[scope.hint_index].value) {
                            scope.left_compare = r[r.length - 1].film.title;
                            scope.right_compare = '';
                        }

                        //check if first
                        if ( angular.isDefined(r[0].ratings[scope.hint_index]) && scope.curValue < r[0].ratings[scope.hint_index].value) {
                            scope.left_compare = '';
                            scope.right_compare = r[0].film.title;
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

                scope.typeaheadOptions = {
                    hint: true,
                    highlight: true,
                    minLength: 1,
                };

                scope.typeaheadData = {
                    name: 'films',
                    displayKey: 'title',
                    source: films.ttAdapter()
                };

                scope.$on('typeahead:selected', function(a, b) {
                    //console.log("a", a, "b", b, "review", scope.review);
                })

            }
        }
    }
])

.directive('relationHint', ['$compile', '$timeout',
    function($compile, $timeout) {
        return {
            restrict: 'E',
            templateUrl: '/assets/templates/relation_hint.tmpl.html',
            link: function(scope, element, attrs) {


            }
        }
    }
])


  'use strict';

  angular.module('feed', [
  ])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('feedCtrl', {
      url: '/feed',
      title: 'feed',
      views: {
        'page' : {
          templateUrl: '/assets/templates/home.tmpl.html',
          controller: 'feedCtrl'
        }
      } 
    });
  }])

.controller('feedCtrl', ['$scope', 
  function($scope){
    console.log("hello");
  }])

  'use strict';

  angular.module('filmkeep', ['angularUtils.directives.dirPagination'
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('filmkeep', {
      url: '/fk/{username}',
      title: 'filmkeep',
      views: {
        'page' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      }
    });
  }])

  .controller('FilmkeepCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','imageService',
    function ($scope,$stateParams,ReviewService,userApiService,reviewApiService,imageService) {
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 10; // this should match however many results your API puts on one page
        getResultsPage(1);

        $scope.pagination = {
            current: 1
        };

        userApiService
            .get({user_id:$stateParams.username,username:true},function(response) {
            
                $scope.page_user = response;

            });

        $scope.pageChanged = function(newPage) {
            getResultsPage(newPage);
        };

        function getResultsPage(pageNumber) {
          reviewApiService
              .query({
                  num: $scope.reviews_per_page,
                  page: pageNumber,
                  username:$stateParams.username
              }, function(response) {
                  $scope.total_reviews = response.total;
                  $scope.user_reviews = _.map(response.results, function(r){ 
                    r.poster = $scope.imageService.poster(r.film.poster_path,1);
                    return r;
                  });
                  
              });
        }

    }]) 

  
  ;


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

'use strict';

angular.module('Api', ['ngResource'])

.factory('reviewApiService',
    function($resource) {
        return $resource(
            '/api/review/:review_id', {}, // Query parameters
            {
                update: {
                  method: 'PUT'
                },
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

.factory('ratingTypesApiService',
    function($resource) {
        return $resource(
            '/api/rating_types', {}, // Query parameters
            {
                update: {
                  method: 'PUT'
                },
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

.factory('userApiService',
    function($resource) {
        return $resource(
            '/api/user/:user_id', {}, // Query parameters
            {
                update: {
                  method: 'PUT'
                },
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

;


'use strict';

angular.module('ReviewService', ['Api'])

.factory('ReviewService', [ '$q','ratingTypesApiService', 'reviewApiService',
    function ($q,ratingTypesApiService,reviewApiService) {

     
        function Review(){

        }

        var types_deferred = $q.defer();
        var reviews_deferred = $q.defer();

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

        Review.getReviews = function(){
            return reviews_deferred.promise;
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