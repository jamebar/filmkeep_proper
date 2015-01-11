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
    'search',
    'ae-review',
    'review',
    'filmkeep',
    'feed',
    'watchlist',
    'settings',
    'AlertBox',
    'film',
    'slugifier',
    'ngTouch',
    'hmTouchEvents',
    'angulartics',
    'angulartics.google.analytics'
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider','$stateProvider','$urlRouterProvider','$tooltipProvider', function($locationProvider, $stateProvider,$urlRouterProvider,$tooltipProvider) {

  $locationProvider.html5Mode(true);

  var tooltipFactory = $tooltipProvider.$get[$tooltipProvider.$get.length - 1];
  // decorate the tooltip getter
  $tooltipProvider.$get = [
      '$window',
      '$compile',
      '$timeout',
      '$parse',
      '$document',
      '$position',
      '$interpolate',
      function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate ) {
          // for touch devices, don't return tooltips
          if ('ontouchstart' in $window) {
              return function () {
                  return {
                      compile: function () { }
                  };
              };
          } else {
              // run the default behavior
              return tooltipFactory($window, $compile, $timeout, $parse, $document, $position, $interpolate);
          }
      }
  ];

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

  $stateProvider.state('home', {
    url: '/',
    templateUrl: '/assets/templates/info.tmpl.html',
    controller: 'homeCtrl',
    
  });
}])
.controller('homeCtrl', ['$scope',
    function($scope) {
      
    }
  
])

.controller('wrapperCtrl', ['$scope','$rootScope','msgBus','meApiService','notificationsApiService',
    function($scope,$rootScope,msgBus,meApiService,notificationsApiService) {
      // console.log(me);
      
      msgBus.onMsg('user::loaded', function(e, data){
        $scope.header_user = data;
      });

      msgBus.onMsg('pagetitle::change', function(e, data){
        $scope.page_title = data;
      });

      $scope.newReview = function(){
        msgBus.emitMsg('review::new');
      }

      $scope.editReview = function(id){
        msgBus.emitMsg('review::edit', id);
      }

      $rootScope.$on('$stateChangeStart', 
        function(event, toState, toParams, fromState, fromParams){ 
            $scope.navbarCollapsed = true;
        })
      
      notificationsApiService.getNotifications().then(function(response){
        $scope.notif_items = response;
        $scope.notif_new = _.where(response, { 'is_seen' : false }).length;
      })

      $scope.markSeen = function(){
        notificationsApiService.markSeen();
        $scope.notif_new = 0;
      }

    }
  
])
.controller('appCtrl', ['$sce','msgBus','$scope','$rootScope','$modal','ReviewService','$timeout','reviewApiService','me','watchlistApiService','Slug','filmApiService',
    function($sce,msgBus,$scope,$rootScope,$modal,ReviewService,$timeout,reviewApiService,me,watchlistApiService,Slug,filmApiService) {
       var reviewModalInstance;

       $rootScope.$on('modal::close', function(){
        reviewModalInstance.close();
       });

       msgBus.emitMsg('user::loaded', me.user);

       msgBus.onMsg('review::new', function(e, data){
          $scope.newReview(data);
        });

       msgBus.onMsg('review::edit', function(e, data){
          $scope.editReview(data);
        });

       msgBus.onMsg('film::trailer', function(e, data){
          $scope.getTrailer(data);
        });

       msgBus.onMsg('review::compare', function(e, data){
          $scope.compare(data);
        });



        $scope.getReview = function(id) {
            
            ReviewService.getReview(id).then(function(results) {
                $scope.review = results.review;
                $scope.rating_types = results.rating_types;
                showModal();
            })
           
            $scope.ae_button_label = "Update";
        }

        function showModal(){
            reviewModalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_review.tmpl.html',
          
            });
        }
        
        $scope.compare = function(obj){
          $scope.showcompare = false;
          $scope.cancompare = true;
          var modalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_compare.tmpl.html',
          
            });

          ReviewService.getCompares(obj.film_id).then(function(response){

            if(response == 'false')
            {
              $scope.cancompare = false;
              return false;
            }
            var actives = [me.user.id, obj.user_id];

            _.forEach(response, function(review){

              if( _.indexOf(actives, review.user.id) > -1)
                review.active = true;

              return review;
            })

            response = _.sortBy(response, function(r) { return r.active });

            var me_review = _.remove(response, function(r){ return r.user_id === me.user.id});
            response.unshift(me_review[0]);
            $scope.compares = response;

            $scope.showcompare = true;
            
          });
        }

        function trailerModal(){
          var modalInstance = $modal.open({
              scope: $scope,
              templateUrl: '/assets/templates/modal_trailer.tmpl.html',
        
          });
        }
        $scope.slugify = function(input) {
        
            return Slug.slugify(input);
        };

        $scope.getTrailer = function(tmdb_id){
          $scope.trailer_source = false;
          $scope.trailer_sources = [];
          
          filmApiService.getTrailer(tmdb_id).then(function(response){
            if(angular.isDefined(response.youtube) && response.youtube.length>0){
              $scope.trailer_source = $sce.trustAsResourceUrl('//www.youtube.com/embed/' + response.youtube[0].source);
              $scope.current_trailer = response.youtube[0].source;
              $scope.trailer_sources = response.youtube;
            }
            trailerModal();
            
          })
        }

        $scope.loadTrailer = function(id){
          $scope.current_trailer = id;
          $scope.trailer_source = $sce.trustAsResourceUrl('//www.youtube.com/embed/' + id);
        }

        $scope.editReview = function(id){
            $scope.getReview(id);
        }

        $scope.addNewReview = function(){
          showModal();
        }

        

        $scope.newReview = function(film){
            $scope.review = new reviewApiService();
            ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = _.map(results, function(r){ r.value = 1000; return r });
            });

            if (typeof film === 'object') {
              $scope.review.film = film;
            }

            showModal();
                
        }

        $scope.toPercent = function(num){
            return num/2000 * 100;
        }

        $scope.watchlist = function(obj)
        {
          var film_id = angular.isDefined(obj.film_id) ? obj.film_id : obj.id;
          $scope.$broadcast('watchlist::addremove', film_id);

          watchlistApiService
            .addRemoveWatchlist(film_id).then(function(response) {

                // console.log(response);
                
            });
        }

        
        
    }
])
.directive('closeMe', [ '$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element,attrs) {
        var delay = attrs.closeMe || 3000;
        
        $timeout(function(){
            element.remove();
        }, delay);
    }
  }
}])

.directive('filmObject', ['$rootScope','watchlistApiService','msgBus','meApiService','Slug',function($rootScope,watchlistApiService,msgBus,meApiService,Slug) {
  return {
    restrict: 'E',
    scope:{
      film: '=film',
      review: '=review',
    },
    replace: true,
    templateUrl: '/assets/templates/film_object.tmpl.html',
    link: function(scope, element,attrs) {

        scope.me = meApiService.meData();
        scope.horizontal = attrs.horizontal || false;

        scope.watchlist = function(obj)
        {
          var film_id = angular.isDefined(obj.film_id) ? obj.film_id : obj.id;
          $rootScope.$broadcast('watchlist::addremove', film_id);

          watchlistApiService
            .addRemoveWatchlist(film_id).then(function(response) {

            });
        }

        scope.slugify = function(input) {
            return Slug.slugify(input);
        };

        scope.newReview = function(film){
           msgBus.emitMsg('review::new', film);
        }

        scope.compare = function(review){
           msgBus.emitMsg('review::compare', review);
        }

        scope.editReview = function(review){
           msgBus.emitMsg('review::edit', review);
        }

        scope.getTrailer = function(tmdb_id){
           msgBus.emitMsg('film::trailer', tmdb_id);
        }

        scope.$on('watchlist::addremove', function(ev, film_id){
          if(scope.film.id === film_id)
            {
              scope.film.on_watchlist = scope.film.on_watchlist === 'true' ? 'false' : 'true';
            }
        })
    }
  }
}])

.directive('notifItems', [
  function(){
    return {
      restrict: 'E',
      templateUrl: '/assets/templates/notifications.tmpl.html',
      link: function(scope,element,attr){

      }
    }
}])

.directive('ratingTypeLabel', [ function() {
  return {
    restrict: 'A',
    scope: {
      type: '=type'
    },
    template: '<span>%%labelLeft%%<span ng-show="labelRight" class="pull-right">%%labelRight%%</span><span ng-show="rating-type.new" class="newlabel"> (New)</span>',
    link: function(scope, element,attrs) {
        var labels = scope.type.label.split("|");
        scope.labelLeft = labels[0];
        scope.labelRight = labels.length>0 ? labels[1] : false;
        
    }
  }
    
}])

.directive('avatar', [ function() {
  return {
    restrict: 'E',
    scope: {  
      user: '=info',
    },
    templateUrl: '/assets/templates/avatar.tmpl.html',
    link: function(scope, element,attrs) {
       
        scope.disabled = attrs.disableClick || false;

        scope.$watch('user', function(old, newV){
          setInitials();
        })

        function setInitials()
        {

          if(angular.isDefined(scope.user) && !scope.user.avatar)
          {

            scope.initials = getInitials(scope.user.name)
          }
        }
        
        function getInitials(name)
        {
          var temp_name = name.split(' ');
          var initials = '';
          _.forEach(temp_name, function(n){
            initials += n.charAt(0);
          })
          return initials;
        }
        // var labels = scope.label.split("|");
        // scope.labelLeft = labels[0];
        // scope.labelRight = labels.length>0 ? labels[1] : false;
       
    }
  }
    
}])

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
  return {
    isFollowing : function(user)
    {
      var me = meApiService.meData();
      // console.log(me, user.id)
      if(!angular.isDefined(me.user))
        return false;
      
       
      return _.find(me.user.followers, {'id': user.id}) ? true : false;
    }
  }

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
                'filmkeep\\watchlist':'added',
                'filmkeep\\follower':'started following'
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

.directive('scrollPosition', ['$window', function ($window) {
  return {
    scope: {
      scroll: '=scrollPosition'
    },
    link: function(scope, element, attrs) {
      scope.scroll = 0;
      function update() {
        scope.scroll = $window.pageYOffset;
        scope.$apply();
      }
      $window.addEventListener('scroll', update, false);
      scope.$on('$destroy', function() {
        $window.removeEventListener('scroll', update, false);
      });
    }
  };
}])
;
/*global _ */
/*global moment*/

'use strict';

var aeReview = angular.module('ae-review', [
    'Api',
    'ngAnimate',
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
.directive('addEditReview', ['$rootScope','$filter','$document','$modal','$compile','$timeout','ratingTypesApiService', 'reviewApiService', 'msgBus','ReviewService','AlertService',
    function($rootScope,$filter,$document,$modal,$compile,$timeout,ratingTypesApiService, reviewApiService,msgBus, ReviewService,AlertService){
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
                var currentSlider;
                var sliderTimeout;
                scope.show_hint = false;
                scope.left = "";
                scope.right = "";
                scope.loader = false;
                // scope.relation_top = window.event.clientY;
                scope.ae_button_label = scope.review.id ? "Update" : "Add";
                
                
                ReviewService.getReviews().then(function(results){
                        scope.reviews = results;
                    })

                scope.reviewSubmit = function() {
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
                    {
                      scope.loader = true;
                      scope.review.$update({review_id:scope.review.id}).then(function(){
                        scope.loader = false;
                        $rootScope.$broadcast('modal::close');
                        $rootScope.$broadcast('review::updated', scope.review);
                        AlertService.Notice("Your review of '" + scope.review.film.title + "' has been updated");
                      });
                    }
                    else
                    {
                      if(angular.isDefined(scope.review.film) && angular.isDefined(scope.review.film.tmdb_id))
                      {
                        scope.loader = true;
                        scope.review.$save().then(function(){
                          scope.loader = false;
                          $rootScope.$broadcast('modal::close');
                          $rootScope.$broadcast('review::created', scope.review);
                          AlertService.Notice("Your review of '" + scope.review.film.title + "' has been created");
                        });
                      }
                      else{
                        AlertService.Alert("Whoops, you must choose a film before saving.");
                      }
                    }
                      
                    // var newReview = new reviewApiService();
                    // newReview
                    // scope.review = new reviewApiService();
                }

                scope.sliding = function(el) {
                    
                    if(currentSlider != el)
                    {
                      scope.setCurrent(el);
                      currentSlider = el;
                    } 
                    inBetween();

                }

                scope.$on('slider::start', function(e){
                    scope.fade_slider = true;
                    scope.show_hint = true;
                });

                scope.$on('slider::end', function(e){
                    scope.hideHint();
                    scope.$apply();
                });

                scope.setCurrent = function(el) {
                    scope.hint_index = el.element ? (el.element.context.id *1) : el;

                    sortedReviews = _.sortBy(scope.reviews, function(r) {
                        return r.ratings[scope.hint_index] ? r.ratings[scope.hint_index].value : 0;
                    })
                    scope.relation_top = $('#slider-'+ el).offset().top + $('.modal').scrollTop() - $(window).scrollTop() - 75;
                    inBetween();
                    
                    scope.fade_slider = true;
                    scope.show_hint = true;
                }

                scope.hideHint = function() {
                    scope.fade_slider = false;
                    scope.show_hint = false;
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
                    

                   
                    scope.curValue = scope.rating_types[scope.hint_index].value;
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
                                    title: data.title,
                                    tmdb_id: data.id,
                                    release_date: data.release_date.substring(0, 4),
                                    poster: $filter('imageFilter')(data.poster_path,'poster',0)
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
                    source: films.ttAdapter(),
                    templates: {
                      suggestion: function (context) {
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" /></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
                      }
                    }
                };

                scope.$on('typeahead:selected', function(a, b) {
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

  angular.module('search', [
])

  .directive('search', ['$document','$filter','$state',
    function($document,$filter,$state){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/search.tmpl.html',
            link: function(scope, element, attrs) {

              scope.search = {};
              scope.search.query = null;  
              

                var people = new Bloodhound({
                    datumTokenizer: function(d) {
                        return Bloodhound.tokenizers.whitespace(title);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/api/user/search?query=%QUERY',
                        filter: function(list) {
                            return $.map(list.results, function(data) {
                                // if(data.avatar.length < 2) data.avatar = '/assets/img/default-profile.jpg';
                                
                                
                                return {
                                    name: data.name,
                                    avatar: $filter('profileFilter')(data.avatar),
                                    username: data.username
                                };
                            });
                        }
                    }
                });

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
                                    title: data.title ,
                                    tmdb_id: data.id,
                                    poster: $filter('imageFilter')(data.poster_path,'poster',0),
                                    release_date: data.release_date.substring(0, 4)
                                };
                            });
                        }
                    }
                });

                people.initialize();
                films.initialize();

                scope.typeaheadOptions = {
                    hint: true,
                    highlight: true,
                    minLength: 1
                };

                scope.mulitpleData = [
                {
                    name: 'people',
                    displayKey: 'name',
                    source: people.ttAdapter(),
                    templates: {
                      header: '<h3 class="search-title">People</h3>',
                      suggestion: function (context) {
                        return '<div>' +context.name+'<span></span></div>'
                      }
                    }
                },
                {
                    name: 'films',
                    displayKey: 'title',
                    source: films.ttAdapter(),
                    templates: {
                      header: '<h3 class="search-title">Films</h3>',
                      suggestion: function (context) {
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" /></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
                      }
                    }
                }
                ]

                scope.$on('typeahead:autocompleted', searchComplete);
                scope.$on('typeahead:selected', searchComplete);
                
                function searchComplete(event, suggestion, dataset){

                  if(dataset === 'people'){
                    $state.go('root.user.filmkeep', {username: suggestion.username});
                  }

                  if(dataset === 'films'){
                    $state.go('root.film', {filmId: suggestion.tmdb_id, filmSlug: $filter('slugify')(suggestion.title) });
                    
                  }
                  scope.search.query = null;

                }

                

            }

        }
    }
  ]);

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
      },
      resolve: {
        isAuthorized: function (meApiService) {
            return meApiService.isAuthorized();
        } 
      },
      onEnter: function(isAuthorized){
        if(isAuthorized == 0)
          window.location.href = '/users/login';
      }
    });
  }])

.controller('feedCtrl', ['$scope', 'msgBus','streamApiService','me', 'ReviewService','reviewApiService','watchlistApiService','filmApiService',
  function($scope, msgBus,streamApiService,me,ReviewService,reviewApiService,watchlistApiService,filmApiService){
    msgBus.emitMsg('pagetitle::change', 'My Feed' );
    $scope.loading = true;
    $scope.me = me;

    ReviewService.getRatingTypes().then(function(results){
      $scope.rating_types_new = results;
        
    });

    filmApiService.getNowPlaying().then(function(response){
      $scope.now_playing = response;
    })

    watchlistApiService
            .getWatchlist(me.user.id).then(function(response) {
                $scope.watchlist_items = response.results;
            });

    // $scope.$on('watchlist::addremove', function(event, film_id) {

    //     _.forEach($scope.feed_items, function(feed_item){
    //       _.forEach(feed_item.activities, function(activity){
    //         if(activity.object.film_id === film_id)
    //         {
    //           activity.object.on_watchlist = activity.object.on_watchlist === 'true' ? 'false' : 'true';
    //         }
            
    //       })
    //     })
    // });

    // $scope.$on('review::updated', function(event, review) {

    //     _.forEach($scope.feed_items, function(feed_item){
    //       _.forEach(feed_item.activities, function(activity){
    //         // if(activity.object.film_id === film_id)
    //         // {
    //         //   activity.object.on_watchlist = activity.object.on_watchlist === 'true' ? 'false' : 'true';
    //         // }
            
    //       })
    //     })
    // });

    streamApiService.getAggregated()
            .then(
              function(response){
                $scope.feed_items = response;
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
    // var now = moment.utc();
    // console.log('now', date)
    return moment.utc(date).fromNow(true);
  }
})

  'use strict';

  angular.module('film', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.film', {
      url: '/f/{filmId}_{filmSlug}',
      title: 'Film',
      views: {
        'page' : {
          templateUrl: '/assets/templates/film.tmpl.html',
          controller: 'FilmCtrl'
        }
      },
      resolve: {
        FilmLoad: function($stateParams,filmApiService) {
         
          return filmApiService.getFilm($stateParams.filmId);
          
        }, 
      }
    });
  }])

  .controller('FilmCtrl', ['$scope', 'msgBus','$stateParams','me','FilmLoad',
    function ($scope,msgBus,$stateParams,me,FilmLoad) {
        msgBus.emitMsg('pagetitle::change', FilmLoad.film.title );
        $scope.me = me;
        FilmLoad.film.film_id = FilmLoad.film.id;
        $scope.film = FilmLoad.film;
        $scope.follower_reviews = FilmLoad.follower_reviews;

        


        $scope.$on('watchlist::addremove', function(event, film_id) {

          $scope.film.on_watchlist = $scope.film.on_watchlist === 'true' ? 'false' : 'true';
                
        });

    }]) 

  
  ;


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
            .get({id:$stateParams.username,username:true}, function(response){
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

  .controller('userCtrl', ['$scope', 'msgBus', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory','me','page_user',
    function ($scope, msgBus,$stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory,  me, page_user) {
        
        $scope.user_reviews = [];
        $scope.total_reviews = 0;

        page_user.following = followerFactory.isFollowing(page_user);

        if(angular.isDefined(me.user))
          $scope.myPage = page_user.id === me.user.id;

        $scope.showFollow = angular.isDefined(me.user) && !$scope.myPage;

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

    .controller('FilmkeepCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory',
    function ($scope, msgBus,$stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory  ) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Filmkeep" );
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 20; // this should match however many results your API puts on one page
        
        $scope.sort_by = 'created_at'
        $scope.sort_by_rating_type = 'null';
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

        $scope.sortByRatingType = function(type_id){
          $scope.sort_by_rating_type = type_id;
          // getResultsPage(1);
          if($scope.pagination.current === 1)
            getResultsPage(1);
          else
            $scope.pagination.current = 1;
          
        }

        function getResultsPage(pageNumber) {
          reviewApiService
              .query({
                  num: $scope.reviews_per_page,
                  page: pageNumber,
                  username: $stateParams.username,
                  sort_by: $scope.sort_by,
                  sort_by_rating_type: $scope.sort_by_rating_type
              }, function(response) {
                  $scope.total_reviews = response.total;
                  $scope.user_reviews = response.results;
                  
              });
        }

    }]) 
  

  
  ;

angular.module('AlertBox', [])
    .service('AlertService', [ '$timeout', function($timeout) {

        this.delay = 2000;
        
        this.alerts = [];
        this.warnings = [];
        this.notices = []

        this.setCloseDelay = function(delay) {
            this.delay = delay;
        }
        
        this.removeMessage = function(msgType, message, delay) {
            var tracked = this[msgType + 's'];
            if (angular.isDefined(delay)) {
                $timeout(
                    function() {
                        var index = tracked.indexOf(message);
                        if (index > -1) {
                            tracked.splice(index,1);
                        }
                    }, 
                    this.delay
                );
            } else {
                var index = tracked.indexOf(message);
                if (index > -1) {
                    tracked.splice(index,1);
                }
            }
        };
        
        this.Message = function(msgType, message) {
            var key = msgType + 's';
            this[key].push(message);
            this.removeMessage(msgType, message, this.delay);
        };
        
        this.Alert = function(message) { this.Message('alert', message); }
        this.Warning = function(message) { this.Message('warning', message); }
        this.Notice = function(message) { this.Message('notice', message); }

    } ] )
    .directive('alertBox', [ 'AlertService', function(AlertService) {
        return {
            restrict: 'E',
            
            compile: function(element, attrs) {
                attrs.boxClass = attrs.boxClass || "alert-box";
                attrs.alertClass = attrs.alertClass || "alert";
                attrs.noticeClass = attrs.noticeClass || "alert-success";
                attrs.warningClass = attrs.warningClass || "alert-warning";
            },
            
            scope: {
                alertClass : "@",
                warningClass : "@",
                noticeClass : "@",
                boxClass : "@"
            },
            
            controller: function($scope) {
                $scope.alerts = AlertService.alerts;
                $scope.warnings = AlertService.warnings;
                $scope.notices = AlertService.notices;
            },
            template:  '<div ng-repeat="alert in alerts track by $index" class="fadeInDown fadeOutUp animated" ng-class="[boxClass, alertClass]">{{alert}}</div> \
                        <div ng-repeat="warning in warnings track by $index" class="fadeInDown fadeOutUp animated" ng-class="[boxClass, warningClass]">{{warning}}</div> \
                        <div ng-repeat="notice in notices track by $index" class="fadeInDown fadeOutUp animated" ng-class="[boxClass, noticeClass]">{{notice}}</div>'
        };

    } ] );

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

  .controller('ReviewCtrl', ['$scope','msgBus','$rootScope', '$stateParams','ReviewService','ReviewLoad','me',
    function ($scope,msgBus,$rootScope,$stateParams,ReviewService,ReviewLoad,me) {
            msgBus.emitMsg('pagetitle::change', "Review: " +  ReviewLoad.review.film.title );
            $scope.rating_types = ReviewLoad.rating_types;
            $scope.review = ReviewLoad.review;
            $scope.me = me;
            // console.log($scope.review);
            $scope.toPercent = function(num){
                return num/2000 * 100;
            }

            $scope.$on('watchlist::addremove', function(event, film_id) {

              $scope.review.film.on_watchlist = $scope.review.film.on_watchlist === 'true' ? 'false' : 'true';
                    
            });

            $rootScope.$on('review::updated',function(e,review){
              $scope.review.notes = review.notes;
            })

    }]) 

  
  ;


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
            '/api/rating_types/:id', {}, // Query parameters
            {
                'update': {
                  method: 'PUT', 
                  params: {id: '@id'},
                },
                'delete': {
                  method: 'DELETE', 
                  params: {id: '@id'},
                },
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

.factory('watchlistApiService',
    function($http, $q) {
        var data;

        return({
            getWatchlist: getWatchlist,
            addRemoveWatchlist: addRemoveWatchlist
        });

        

        function getWatchlist(user_id) {
 
            var request = $http({
                method: "get",
                url: "/api/watchlist",
                params: {
                    action: "get",
                    user_id: user_id
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function addRemoveWatchlist(film_id) {
 
            var request = $http({
                method: "post",
                url: "/api/watchlist/add-remove",
                params: {
                    action: "post",
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

.factory('notificationsApiService',
    function($http, $q) {
        var data;

        return({
            getNotifications: getNotifications,
            markSeen: markSeen
        });

        

        function getNotifications() {
 
            var request = $http({
                method: "get",
                url: "/api/notifications",
                params: {
                    action: "get",
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function markSeen() {
 
            var request = $http({
                method: "post",
                url: "/api/notifications/seen",
                params: {
                    action: "post",
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

.factory('userApiService',
    function($resource) {
        return $resource(
            '/api/user/:id', {}, // Query parameters
            {
                'update': {
                  method: 'PUT', 
                  params: {id: '@id'},
                },
                'query': {
                    method: 'GET'
                },
                'search':{
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
        var meData = {};

        return({
            me: me,
            meData: getMeData,
            isAuthorized: isAuthorized
        });

        function getMeData(){
          return meData;
        }

        function isAuthorized() {
 
            var request = $http({
                method: "get",
                url: "/api/user/isauthorized",
                params: {
                    action: "get",
                }
            });
            return( request.then( handleSuccess, handleError ) );

        }

        function me() {
            
            var request = $http({
                method: "get",
                url: "/api/me",
                params: {
                    action: "get",
                }
            });
            return( request.then( function(response){
              meData = response.data;
              return( response.data );
            } ) );

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

.factory('filmApiService',
    function($http, $q) {

        return({
            getFilm: getFilm,
            getTrailer: getTrailer,
            getNowPlaying: getNowPlaying
        });

        function getFilm(tmdb_id) {
 
            var request = $http({
                method: "get",
                url: "/api/film",
                params: {
                    action: "get",
                    tmdb_id: tmdb_id
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function getTrailer(tmdb_id) {
 
            var request = $http({
                method: "get",
                url: "/api/tmdb/trailer/" + tmdb_id,
                params: {
                    action: "get",
                    tmdb_id: tmdb_id
                }
            });

            return( request.then( handleSuccess, handleError ) );

        }

        function getNowPlaying() {
 
            var request = $http({
                method: "get",
                url: "/api/tmdb/nowplaying/",
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
                        val.new = false;
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

  angular.module('settings', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.settings', {
      abstract: true,
      url: '/settings',
      title: 'Settings',
      views: {
        'page' : {
          templateUrl: '/assets/templates/settings/settings.tmpl.html',
          controller: 'settingsCtrl'
        }
      },
      resolve: {
        isAuthorized: function (meApiService) {
            return meApiService.isAuthorized();
        } 
      },
      onEnter: function(isAuthorized){
        if(isAuthorized == 0)
          window.location.href = '/users/login';
      }
    });

    $stateProvider.state('root.settings.profile', {
      url: '/profile',
      title: 'Settings - profile',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/profile.tmpl.html',
          controller: 'settingsProfileCtrl'
        }
      },
    });
    $stateProvider.state('root.settings.filmeters', {
      url: '/filmeters',
      title: 'Settings - filmeters',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/filmeters.tmpl.html',
          controller: 'settingsFilmetersCtrl'
        }
      },
    });

  }])

  .controller('settingsCtrl', ['$scope','me','userApiService','AlertService','$state',
    function ($scope, me,userApiService,AlertService,$state) {

      $scope.current_user = new userApiService();
        _.assign($scope.current_user, me.user);
        
      $scope.tabs = [
        {title: 'Profile', state:'root.settings.profile', active:false},
        {title: 'Filmeters', state:'root.settings.filmeters', active:false}
      ];

      _.forEach($scope.tabs, function(tab){
        if($state.includes(tab.state))
          tab.active = true;
      });

      $scope.gotoTab = function(dest){
        $state.go(dest);
      }

  }]) 

  .controller('settingsProfileCtrl', ['$scope','me','userApiService','AlertService','msgBus',
    function ($scope, me,userApiService,AlertService,msgBus) {
        msgBus.emitMsg('pagetitle::change', "Settings: Profile");

        $scope.saveUser = function(){
          $scope.current_user.$update(function(response){
              AlertService.Notice("Your changes have been saved");
              _.assign(me.user, response);
          },function(response_headers){
              AlertService.Warning(response_headers.data);
          });
        }

  }]) 

  .controller('settingsInvitesCtrl', ['$scope','me','userApiService','AlertService','msgBus',
    function ($scope, me,userApiService,AlertService,msgBus) {


  }]) 

  .controller('settingsFilmetersCtrl', ['$scope','me','userApiService','AlertService','ratingTypesApiService','ReviewService','msgBus',
    function ($scope, me,userApiService,AlertService,ratingTypesApiService,ReviewService,msgBus) {
        msgBus.emitMsg('pagetitle::change', "Settings: Filmeters");
        $scope.newcriteria = new ratingTypesApiService();
        ReviewService.getRatingTypes().then(function(results){
          $scope.types = results;
            
        });

        $scope.filterCommon = function(element) {
          return element.user_id === 0 ? true : false;
        };

        $scope.filterCustom = function(element) {
          return element.user_id !== 0 ? true : false;
        };

        $scope.saveFilmeter = function(){
          $scope.newcriteria.$save(function(response){
            $scope.types.push(response);
            $scope.newcriteria = new ratingTypesApiService();

          });
        }

        $scope.updateFilmeter = function(type){
          var t = new ratingTypesApiService();
          _.assign(t,type);
          t.$update(function(response){
            AlertService.Notice("Your Filmeter is updated");
            type.orig = type.label;
            type.edit = false;
          })
        }

        $scope.deleteFilmeter = function(meter){
          var filmeter = new ratingTypesApiService();
        
          filmeter.id = meter.id;
          filmeter.$delete(function(response){
            $scope.types  = response.results;
            ReviewService.setRatingTypes(response.results);
          });
        }

  }]) 

  .directive('pwCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }])
   
   .directive('ngReallyClick', ['$modal',
        function($modal) {

          var ModalInstanceCtrl = function($scope, $modalInstance) {
            $scope.ok = function() {
              $modalInstance.close();
            };

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
          };

          return {
            restrict: 'A',
            scope: {
              ngReallyClick:"&"
            },
            link: function(scope, element, attrs) {
              element.bind('click', function() {
                var message = attrs.ngReallyMessage || "Are you sure ?";

                var modalHtml = '<div class="modal-body"><p>' + message + '</p></div>';
                modalHtml += '<div class="modal-footer"><button class="btn btn-success" ng-click="ok()">OK</button><button class="btn btn-default" ng-click="cancel()">Cancel</button></div>';

                var modalInstance = $modal.open({
                  template: modalHtml,
                  controller: ModalInstanceCtrl,
                  size:'sm'
                });

                modalInstance.result.then(function() {
                  scope.ngReallyClick();
                }, function() {
                  //Modal dismissed
                });
                
              });

            }
          }
        }
      ])

  
  ;


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
      
    });
  }])

  .controller('WatchlistCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','userApiService','reviewApiService','followApiService','watchlistApiService','followerFactory','me','page_user',
    function ($scope,msgBus, $stateParams, ReviewService, userApiService, reviewApiService, followApiService, watchlistApiService, followerFactory,  me, page_user) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Watchlist" );

        watchlistApiService
            .getWatchlist(page_user.id).then(function(response) {

                $scope.watchlist_items = response.results;
            });
        

    }]) 

  
  ;
