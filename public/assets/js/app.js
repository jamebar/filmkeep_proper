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
    'watchlist'
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider','$stateProvider', function($locationProvider, $stateProvider) {

  $locationProvider.html5Mode(true);

  $stateProvider.state('root', {
    abstract: true,
    templateUrl: '/assets/templates/app.tmpl.html',
    controller: 'appCtrl',
    resolve: {
      me: function (meApiService) {
          return meApiService.me();
      } 
    }
  });
}])

.controller('appCtrl', ['$scope','msgBus','$modal','ReviewService','$timeout','reviewApiService','me',
    function($scope,msgBus,$modal,ReviewService,$timeout,reviewApiService,me) {
       
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
        
        $scope.compare = function(obj){
          console.log(obj);
          var modalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_compare.tmpl.html',
          
            });

          ReviewService.getCompares(obj.film_id).then(function(response){
            var actives = [me.user.id, obj.user_id];

            _.forEach(response, function(review){

              if( _.indexOf(actives, review.user.id) > -1)
                review.active = true;

              return review;
            })

            var me_review = _.remove(response, function(r){ return r.user_id === me.user.id});
            response.unshift(me_review[0]);
            $scope.compares = response;

          });
        }

        $scope.editReview = function(id){
            $scope.getReview(id);
            //openModal(id);

        }

        $scope.newReview = function(film){
   

            $scope.review = new reviewApiService();
            ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = results;
                
            });

            if (typeof film === 'object') {
              console.log(film);
              $scope.review.film = film;
            }
            showModal();
                
        }

        $scope.toPercent = function(num){
                return num/2000 * 100;
            }

       
        
    }
])

.filter('imageFilter', [ function() {
  return function(path, type, size)
  {
    var image_config = image_path_config;
    
    var s = size || 0;
    var t = type || 'poster';

    return image_config.images.base_url + image_config.images[type + '_sizes'][size] +  path;

  }
    
}])

.factory('followerFactory', ['meApiService',function(meApiService){
  
  var follower = {};

  follower.isFollowing = function(user)
  {
    var me = meApiService.meData();
    
    var t = _.find(me.user.followers, {'id': user.id}) ? true : false;
    console.log('me',me, 'user id', user.id, 'results',t);
    return t;
  }

  return follower;
}])

.filter('profileFilter', [ function() {
  return function(path)
  {
    var p = path || '/assets/img/default-profile.jpg';
    return p;

  }
    
}])

.filter('verb',function(){
  return function(verb){
    var keys = {'filmkeep\\review':'reviewed',
                'filmkeep\\watchlist':'added'
                };
    return keys[verb];
  }
})


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

                        if (scope.curValue >= r[i].ratings[scope.hint_index].value && scope.curValue <= r[next_val].ratings[scope.hint_index].value) {
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

  angular.module('filmkeep', ['angularUtils.directives.dirPagination'
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.user', {
      abstract:true,
      url: '/u/{username}',
      title: 'filmkeep',
      views: {
        'page' : {
          templateUrl: '/assets/templates/user.tmpl.html',
          controller: 'userCtrl'
        }
      },

      resolve: {
        page_user: function(userApiService, $stateParams, $q){
          var deferred = $q.defer();
          userApiService
            .get({user_id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);
            });
          return deferred.promise;
        }
      }
    });

    $stateProvider.state('root.user.filmkeep', {
      url: '/filmkeep',
      title: 'filmkeep',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      },
    });

    
  }])

  .controller('userCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory','me','page_user',
    function ($scope, $stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory,  me, page_user) {
        $scope.user_reviews = [];
        $scope.total_reviews = 0;


        page_user.following = followerFactory.isFollowing(page_user);
        $scope.myPage = page_user.id === me.user.id;
        $scope.page_user = page_user; 
                



        $scope.follow = function(page_user){

          if(page_user.following){

            //make change immediately, should be in callback, but it's too slow
            page_user.following = false;
            followApiService.unfollow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }else{

            page_user.following = true;
            followApiService.follow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }


        }

        

    }]) 

    .controller('FilmkeepCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory','me','page_user',
    function ($scope, $stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory,  me, page_user) {
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 10; // this should match however many results your API puts on one page
        getResultsPage(1);

        ReviewService.getRatingTypes().then(function(response){
          $scope.rating_types = response;
          
        });

        $scope.pagination = {
            current: 1
        };

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
                  $scope.user_reviews = response.results;
                  
              });
        }

    }]) 
  

  
  ;


  'use strict';

  angular.module('feed', [
  ])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('root.feed', {
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

.controller('feedCtrl', ['$scope', 'streamApiService','me',
  function($scope, streamApiService,me){
    $scope.loading = true;
    $scope.me = me;
    streamApiService.getAggregated()
            .then(
              function(response){
                $scope.feed_items = response;
                console.log(response);
                $scope.loading = false;
            });

    $scope.toPercent = function(num){
        return num/2000 * 100;
    }
  }])

.directive('feedItems', [
  function(){
    return {
      restrict: 'E',
      templateUrl: '/assets/templates/feed/feed_items.tmpl.html',
      link: function(scope,element,attr){

      }
    }
}])

.filter('fDate',function(){
  return function(date){
    moment.locale('en', {
      relativeTime : {
          future: "in %s",
          past:   "%s ago",
          s:  "seconds",
          m:  "1min",
          mm: "%dmins",
          h:  "1h",
          hh: "%dh",
          d:  "1d",
          dd: "%dd",
          M:  "1m",
          MM: "%dm",
          y:  "1y",
          yy: "%dy"
      }
    });
    return moment(date).fromNow(true);
  }
})

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
            console.log($scope.review);
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

.factory('watchlistApiService',
    function($resource) {
        return $resource(
            '/api/watchlist/:watchlist_item_id', {}, // Query parameters
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

.factory('streamApiService',
    function($http, $q) {

        return({
            getAggregated: getAggregated,
        });

        function getAggregated() {
 
            var request = $http({
                method: "get",
                url: "/api/stream/",
                params: {
                    action: "get",
                    type: "aggregated",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function getFlat() {
 
            var request = $http({
                method: "get",
                url: "/api/stream/",
                params: {
                    action: "get",
                    type: "flat"
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }

        function handleSuccess( response ) {

            return( response.data );

        }
    }
)

.factory('compareApiService',
    function($http, $q) {
        var data;

        return({
            getCompares: getCompares
        });

        

        function getCompares(film_id) {
 
            var request = $http({
                method: "get",
                url: "/api/compares",
                params: {
                    action: "get",
                    film_id: film_id
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }

        function handleSuccess( response ) {
            return( response.data );

        }
})

.factory('meApiService',
    function($http, $q) {
        var meData;

        return({
            me: me,
            meData: getMeData
        });

        function getMeData(){
          return meData;
        }

        function me() {
 
            var request = $http({
                method: "get",
                url: "/api/me",
                params: {
                    action: "get",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }

        function handleSuccess( response ) {
            meData = response.data;
            return( response.data );

        }
})

.factory('followApiService',
    function($http, $q) {

        return({
            follow: follow,
            unfollow: unfollow,
            getFollowers: getFollowers
        });

        function follow(follower_id) {
 
            var request = $http({
                method: "post",
                url: "/api/follow/" + follower_id,
                params: {
                    action: "post",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function unfollow(follower_id) {
 
           var request = $http({
                method: "post",
                url: "/api/unfollow/" + follower_id,
                params: {
                    action: "post",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function getFollowers() {
 
           var request = $http({
                method: "get",
                url: "/api/followers",
                params: {
                    action: "get",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleSuccess( response ) {

            return( response.data );

        }
    }
)

;


'use strict';

angular.module('ReviewService', ['Api'])

.factory('ReviewService', [ '$q','ratingTypesApiService', 'reviewApiService', 'compareApiService',
    function ($q,ratingTypesApiService,reviewApiService, compareApiService) {

     
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

  'use strict';

  angular.module('watchlist', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.user.watchlist', {
      url: '/watchlist',
      title: 'watchlist',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/watchlist.tmpl.html',
          controller: 'WatchlistCtrl'
        }
      },
      resolve: {
        page_user: function(userApiService, $stateParams, $q){
          var deferred = $q.defer();
          userApiService
            .get({user_id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);
            });
          return deferred.promise;
        }
      }
    });
  }])

  .controller('WatchlistCtrl', ['$scope', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','watchlistApiService','followerFactory','me','page_user',
    function ($scope, $stateParams, ReviewService, userApiService, reviewApiService, followApiService, watchlistApiService, followerFactory,  me, page_user) {
        

       
        watchlistApiService
            .query({
                user_id: page_user.id,
            }, function(response) {
                console.log(response);
                $scope.watchlist_items = response.results;
                
            });
        

    }]) 

  
  ;
