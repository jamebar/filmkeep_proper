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
    'angulartics.google.analytics',
    'fk.comments',
    'templates',
    'monospaced.elastic',
    'Filters',
    'ngSanitize',
    'getting-started',
    'custom-criteria'
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider','$stateProvider','$urlRouterProvider','$tooltipProvider','$urlMatcherFactoryProvider', function($locationProvider, $stateProvider,$urlRouterProvider,$tooltipProvider,$urlMatcherFactoryProvider) {
  $urlMatcherFactoryProvider.caseInsensitive(true);
  $urlMatcherFactoryProvider.strictMode(false);
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
      me: function (Api) {
          return Api.me();
      } 
    }
  });

  $stateProvider.state('root.home', {
    url: '/',
    views: {
        'page' : {
        templateUrl: '/assets/templates/info.tmpl.html',
        controller: 'homeCtrl',
      }
    }
    
  });

  $stateProvider.state('root.terms', {
    url: '/pages/terms-service',
    views: {
        'page' : {
          templateUrl: '/assets/templates/pages/terms-service.tmpl.html',
          controller: function(msgBus){
            msgBus.emitMsg('pagetitle::change', 'Terms of Service' );
          }
        }
    }
  });

  $stateProvider.state('root.privacy', {
    url: '/pages/privacy',
    views: {
        'page' : {
          templateUrl: '/assets/templates/pages/privacy.tmpl.html',
          controller: function(msgBus){
            msgBus.emitMsg('pagetitle::change', 'Privacy Policy' );
          }
        }
      }
  });

  $stateProvider.state('root.copyright', {
    url: '/pages/copyright',
    views: {
        'page' : {
          templateUrl: '/assets/templates/pages/copyright.tmpl.html',
          controller: function(msgBus){
            msgBus.emitMsg('pagetitle::change', 'Copyright' );
          }
        }
      }
  });
  $stateProvider.state('root.code', {
    url: '/pages/code-of-conduct',
    views: {
        'page' : {
          templateUrl: '/assets/templates/pages/code-of-conduct.tmpl.html',
          controller: function(msgBus){
            msgBus.emitMsg('pagetitle::change', 'Code of Conduct' );
          }
        }
      }
  });
}])
.controller('homeCtrl', ['$scope',
    function($scope) {
      
    }
  
])



.controller('wrapperCtrl', ['$scope','$rootScope','msgBus','$modal','Api',
    function($scope,$rootScope,msgBus,$modal,Api) {

      var s_client, s_user;

      msgBus.onMsg('user::loaded', function(e, data){
        $scope.header_user = data.user;
        if(data.user)
        {
          s_client = stream.connect(data.stream.key, null, data.stream.id);
          s_user = s_client.feed('notification', data.user.id, data.stream.notif_token);

          s_user.subscribe(function(data){
             getNotifications();
          })
        }
      });

      msgBus.onMsg('pagetitle::change', function(e, data){
        $scope.page_title = data;
      });

      $scope.getBackgroundOpacity = function(scroll){
        return 'rgba(50, 50, 50, ' + ((scroll/300) +.4) + ')';
      }

      $scope.getHeight = function(h){
        return h + 'px';
      }
      $scope.newReview = function(){
        msgBus.emitMsg('review::new');
      }

      $scope.editReview = function(id){
        msgBus.emitMsg('review::edit', id);
      }

      $scope.watchlistModal = function(obj){
        $scope.subject = obj;
        $scope.subject.commentable_id = obj.commentable_id || obj.id;
        $scope.subject.commentable_type = obj.commentable_type || 'watchlist';
        var modalInstance = $modal.open({
              scope: $scope,
              templateUrl: '/assets/templates/modal_commentable.tmpl.html',
              backdrop: 'static'
        
          });
      }

      $rootScope.$on('$stateChangeStart', 
        function(event, toState, toParams, fromState, fromParams){ 
            $scope.navbarCollapsed = true;
        })
      
      function getNotifications(){
        Api.Notifications.query(function(response){
          $scope.notif_items = response;
          $scope.notif_new = _.where(response, { 'is_seen' : false }).length;
        })
      }

      $scope.markSeen = function(){
        Api.Notifications.markSeen();
        $scope.notif_new = 0;
      }

      $scope.featureList = function(){
          $scope.featurePreloader = true;
          var featureInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_wtf.tmpl.html',
                backdrop: 'static'
            });

          Api.getWtf().then(function(response){
            var results = response.results.split('|');
            $scope.todos = results[0].split(',');
            $scope.done = results[1].split(',');
            $scope.featurePreloader = false;
          });
        }

        getNotifications();

    }
  
])
.controller('appCtrl', ['$sce','msgBus','$scope','$rootScope','$modal','ReviewService','$timeout','me','Slug','Api',
    function($sce,msgBus,$scope,$rootScope,$modal,ReviewService,$timeout,me,Slug,Api) {
       var reviewModalInstance;
       $scope.first_name = me.user.name.split(' ')[0];

       $rootScope.$on('modal::close', function(){
        reviewModalInstance.close();
       });

       msgBus.emitMsg('user::loaded', me);

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



        $scope.addRemoveToList = function(list_id, film_id, action)
        {
          var list = new Api.Lists();
          list.id = list_id;
          list.$addRemove({film_id:film_id, action: action}).then(function(response){
            console.log(response);
          })
        }

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
                backdrop: 'static'
            });
        }

        
        
        $scope.compare = function(obj){
          $scope.showcompare = false;
          $scope.cancompare = true;
          var modalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_compare.tmpl.html',
                backdrop: 'static'
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

            if(angular.isDefined(response[1]))
              response[1].active = true;
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

        $scope.showVideo = function(){
              $scope.trailer_source = $sce.trustAsResourceUrl('//www.youtube.com/embed/vmw2OVRDJ5g');
              $scope.current_trailer = 'vmw2OVRDJ5g';
              trailerModal();
        }

        $scope.slugify = function(input) {
        
            return Slug.slugify(input);
        };

        $scope.getTrailer = function(tmdb_id){
          $scope.trailer_source = false;
          $scope.trailer_sources = [];
          
          Api.getTrailer(tmdb_id).then(function(response){
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
            $scope.review = new Api.Reviews();
            ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = _.map(results, function(r){ r.value = 1000; return r });
            });

            if (typeof film === 'object') {
              $scope.review.film = film;
            }

            showModal();
                
        }

        $scope.toPercent = function(num){
            return (num/2000 * 100) + '%';
        }

        $scope.watchlist = function(obj)
        {
          var film_id = angular.isDefined(obj.film_id) ? obj.film_id : obj.id;
          $scope.$broadcast('watchlist::addremove', film_id);

          Api.addRemoveWatchlist(film_id).then(function(response) {

            });
        }

        $scope.changeState = function(s){
          $scope.gs_state = s;
        }

        $scope.gs_state = 4;
        var gsModalInstance = $modal.open({
            scope: $scope,
            templateUrl: '/assets/templates/modal_getting_started.tmpl.html',
            backdrop: 'static'
        });
        
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

.directive('textMore', [ function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      textMore: '@',
    },
    template: '<span ng-bind-html="textMore | limitTo: max_length | linky"></span><a ng-click="max_length=1000000" ng-show="textMore.length > max_length ">... read more</a><a ng-click="max_length=max" ng-show="textMore.length < max_length && textMore.length > max"> <i class="glyphicon glyphicon-chevron-left" style="font-size:.8em"></i> less </a>',
    link: function(scope, element,attrs) {
        scope.max = attrs.max || 75;
        scope.max_length = scope.max;
    }
  }
}])

.directive('filmObject', ['$rootScope','msgBus','Slug','Api', '$state', function($rootScope, msgBus, Slug, Api, $state) {
  return {
    restrict: 'E',
    scope:{
      film: '=film',
      review: '=review',
      horizontal: '@',
      comments: '=',
      watchlistmodal: '&commentClick',
      commentObject: '='
    },
    replace: true,
    templateUrl: '/assets/templates/film_object.tmpl.html',
    link: function(scope, element,attrs) {

        scope.me = Api.meData();
        scope.comments_show = angular.isDefined(scope.comments);

        if(scope.film)
          scope.poster_path = scope.film.poster_path;

        if(scope.review)
          scope.poster_path = scope.review.film.poster_path;

        scope.show_watchlist_btn = (scope.film.on_watchlist != null);

        scope.watchlist = function(obj)
        {
          var film_id = angular.isDefined(obj.film_id) ? obj.film_id : obj.id;
          $rootScope.$broadcast('watchlist::addremove', film_id);

          Api.addRemoveWatchlist(film_id).then(function(response) {

            });
        }

        scope.openComments = function(){
          scope.film.showcomments = !scope.film.showcomments
          scope.watchlistmodal(scope.commentObject);
          // console.log(scope.commentObject)
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

        scope.goToLink = function(){
          if(scope.film)
            $state.go('root.film', {filmId: scope.film.tmdb_id, filmSlug: scope.slugify(scope.film.title) });

          if(scope.review)
            $state.go('root.review',{reviewId: scope.review.id})
          
        }
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

.factory('followerFactory', ['Api',function(Api){
  return {
    isFollowing : function(user)
    {
      
      return checkFollowing(user)
    },

    parseFollowing : function(users)
    {
      _.forEach(users, function(u){
        u.following = checkFollowing(u);
      })

      return users;
    }
  }

  function checkFollowing(user){
    var me = Api.meData();
      if(!angular.isDefined(me.user))
        return false;
    return _.find(me.user.followers, {'id': user.id}) ? true : false;
  }

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
.directive('windowHeight', ['$window', function ($window) {
  return {
    scope: {
      wheight: '=windowHeight'
    },
    link: function(scope, element, attrs) {
      scope.wheight = $window.innerHeight;
      function update() {
        scope.wheight = $window.innerHeight;
        scope.$apply();
      }
      $window.addEventListener('resize', update, false);
      scope.$on('$destroy', function() {
        $window.removeEventListener('resize', update, false);
      });
    }
  };
}])
.directive('scrollToItem', function() {                                                      
    return {                                                                                 
        restrict: 'A',                                                                       
        scope: {                                                                             
            scrollTo: "@"                                                                    
        },                                                                                   
        link: function(scope, $elm,attr) {                                                   

            $elm.on('click', function() {                                                    
                $('html,body').animate({scrollTop: $(scope.scrollTo).offset().top }, "slow");
            });                                                                              
        }                                                                                    
    }})
.directive('showhide', function () {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            // find our "show" div
            var show = angular.element(element.find('.showhide-toggle'));
            var opened = true;
            show.bind('click', toggle);

            function toggle() {
                opened = !opened;
                element.removeClass(opened ? 'closed' : 'opened');
                element.addClass(opened ? 'opened' : 'closed');
            }
            toggle();
        }
    }
})

;
/*global _ */
/*global moment*/

'use strict';

var aeReview = angular.module('ae-review', [
    'Api',
    'ngAnimate',
    'ReviewService'
])


.controller('addReviewCtrl', ['$q', '$scope', 'msgBus', 'ReviewService',
    function($q, $scope, msgBus, ReviewService) {

    }
])
.directive('addEditReview', ['$rootScope','$filter','$document','$modal','$compile','$timeout', 'msgBus','ReviewService','AlertService',
    function($rootScope,$filter,$document,$modal,$compile,$timeout,msgBus, ReviewService,AlertService){
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
                          msgBus.emitMsg('review::added', scope.review);
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
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" onerror="if (this.src != \'/assets/img/fallback-poster.jpg\') this.src = \'/assets/img/fallback-poster.jpg\';"/></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
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

  angular.module('fk.comments', [
])

  .directive('comments', ['Api','AlertService','$timeout',
    function(Api,AlertService,$timeout){
        return {
            restrict: 'E',
            scope:{
              type : '@',
              commentableId: '=',
              filmId: '=',
            },
            templateUrl: '/assets/templates/comments/comments.tmpl.html',
            link: function(scope, element, attrs) {
              $timeout(function() {
                element.find('.comment_input').focus();
              });

              if (scope.type.indexOf('Filmkeep') > -1) {
                scope.type = scope.type.split('\\')[1].toLowerCase();
              };
              
              Api.Comments.query({type: scope.type, type_id: scope.commentableId}, function(response){
                scope.comments = response.results;
              });
              scope.me = Api.meData();

              scope.newComment = function(){
                scope.comment = new Api.Comments();
              }
              
              scope.addComment = function(){
                scope.comment.type = scope.type;
                scope.comment.type_id = scope.commentableId;
                scope.comment.film_id = scope.filmId;
                scope.comment.$save(function(response){
                  AlertService.Notice("Your comment has been added.");
                  scope.comments.push(scope.comment)
                  scope.newComment();
                },function(response){
                  AlertService.Notice("Whoops, make sure you type a comment.");
                  
                })
              }

              scope.newComment();

            }

        }
    }
  ])

  .directive('commentsForm', ['Api',
    function(Api){
        return {
            restrict: 'E',
            templateUrl: '/assets/templates/comments/comment_form.tmpl.html',
            link: function(scope, element, attrs) {

            }

        }
    }
  ]);

  'use strict';

  angular.module('custom-criteria', [
])

  .directive('customCriteria', ['AlertService','ReviewService','msgBus','Api',
    function(AlertService,ReviewService,msgBus,Api){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/custom_criteria.tmpl.html',
            link: function($scope, element, attrs) {
              var me = Api.me();
              $scope.common = attrs.common || false;
              $scope.custom = attrs.custom || true;

              $scope.newcriteria = new Api.RatingTypes();
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
                  $scope.newcriteria = new Api.RatingTypes();

                });
              }

              $scope.updateFilmeter = function(type){
                var t = new Api.RatingTypes();
                _.assign(t,type);
                t.$update(function(response){
                  AlertService.Notice("Your slider is updated");
                  type.orig = type.label;
                  type.edit = false;
                })
              }

              $scope.deleteFilmeter = function(meter){
                var filmeter = new Api.RatingTypes();
              
                filmeter.id = meter.id;
                filmeter.$delete(function(response){
                  $scope.types  = response.results;
                  ReviewService.setRatingTypes(response.results);
                });
              }


            }

        }
    }
  ]);

  'use strict';

  angular.module('getting-started', [
])

  .directive('followFriends', ['Api','followerFactory', 
    function(Api, followerFactory){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/getting_started/follow_friends.tmpl.html',
            link: function(scope, element, attrs) {
              $('.follow-friends').perfectScrollbar();
              scope.loading = true;

              Api.Users.query(function(response){
                scope.users = followerFactory.parseFollowing(response);
                $('.follow-friends').perfectScrollbar('update');
                scope.loading = false;
              });

              scope.follow = function(user){
                if(user.following){
                  //make change immediately, should be in callback, but it's too slow
                  user.following = false;
                  Api.unfollow(user.id).then(function(response){
                    // me.user.followers = response.followers;
                  });
                }else{
                  user.following = true;
                  Api.follow(user.id).then(function(response){
                    // me.user.followers = response.followers;
                  });
                }
              }

            }

        }
    }
  ])

  .directive('gsCustomCriteria', ['Api', 
    function(Api){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/getting_started/custom_criteria.tmpl.html',
            link: function(scope, element, attrs) {
              $('.custom-criteria').perfectScrollbar();


            }

        }
    }
  ])

  .directive('gsRate', ['Api', 'msgBus',
    function(Api, msgBus){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/getting_started/rate.tmpl.html',
            link: function(scope, element, attrs) {
              scope.rate = {};
              var curr_pos = 'love';

              $('.rate').perfectScrollbar();

              scope.newReview = function(pos){
                msgBus.emitMsg('review::new');
                curr_pos = pos
              }

              msgBus.onMsg('review::added', function(e, data){
                scope.rate[curr_pos] = data.film.poster_path;
              });


            }

        }
    }
  ]);

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
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" onerror="if (this.src != \'/assets/img/fallback-poster.jpg\') this.src = \'/assets/img/fallback-poster.jpg\';"/></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
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
        isAuthorized: ['Api', function (Api) {
            return Api.isAuthorized();
        }] 
      },
      onEnter: function(isAuthorized){
        if(isAuthorized == 0)
          window.location.href = '/users/login';
      }
    });
  }])

.controller('feedCtrl', ['$scope', 'msgBus','me', 'ReviewService','Api','$state',
  function($scope, msgBus,me,ReviewService,Api,$state){
    msgBus.emitMsg('pagetitle::change', 'My Feed' );
    $scope.loading = true;
    $scope.me = me;
    $scope.announcements = me.announcements;

    var client = stream.connect(me.stream.key, null, me.stream.id);
    var stream_user = client.feed('aggregated', me.user.id, me.stream.agg_token);

    stream_user.subscribe(function(data){
       getFeed();
    })

    ReviewService.getRatingTypes().then(function(results){
      $scope.rating_types_new = results;
        
    });

    Api.Lists.query({with_films:true}, function(results){
      $scope.lists = results.results;
    })

    Api.getNowPlaying().then(function(response){
      $scope.now_playing = response;
    })

    Api.getWatchlist(me.user.id).then(function(response) {
                $scope.watchlist_items = response.results;
            });
    $scope.releaseDate = function(d){
      return moment(d).format('YYYY');
    }

    function getFeed(){
      Api.getAggregated()
            .then(
              function(response){
                $scope.feed_items = response;
                $scope.loading = false;
                
            });
    }
    

    $scope.toPercent = function(num){
        return (num/2000 * 100) + '%';
    }

    $scope.openComments = function(obj){
      if(obj.commentable_type == 'Filmkeep\\Review')
        $state.go('root.review', {reviewId: obj.commentable_id });
      else
        $scope.watchlistModal(obj);
    }

    getFeed();
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
      url: '/f/{filmId}-{filmSlug}',
      title: 'Film',
      views: {
        'page' : {
          templateUrl: '/assets/templates/film.tmpl.html',
          controller: 'FilmCtrl'
        }
      },
      resolve: {
        FilmLoad:['$stateParams','Api', function($stateParams,Api) {
          return Api.getFilm($stateParams.filmId);
        }], 
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
        page_user: ['Api','$stateParams','$q',function(Api, $stateParams, $q){
          var deferred = $q.defer();
          Api.Users
            .get({id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);

            });
          return deferred.promise;
        }]
      }
    });

    $stateProvider.state('root.user.filmkeep', {
      url: '',
      title: 'filmkeep',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      },
    });

    $stateProvider.state('root.user.filmkeep2', {
      url: '/filmkeep',
      title: 'filmkeep',
       views: {
        'page-child' : {
          template: '',
          controller: ['$stateParams','$state',function($stateParams,$state){
            $state.go('root.user.filmkeep', {username: $stateParams.username });
          }]
        }
      },
    });

    
  }])

  .controller('userCtrl', ['$scope', 'msgBus', '$stateParams','ReviewService','followerFactory','me','page_user','Api',
    function ($scope, msgBus, $stateParams, ReviewService, followerFactory,  me, page_user, Api) {
        
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
            Api.unfollow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }else{

            page_user.following = true;
            Api.follow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }

        }

    }]) 

    .controller('FilmkeepCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','followerFactory','Api',
    function ($scope, msgBus,$stateParams, ReviewService, followerFactory, Api ) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Filmkeep" );
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 24; // this should match however many results your API puts on one page
        
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
          Api.Reviews
              .query({
                  num: $scope.reviews_per_page,
                  page: pageNumber,
                  username: $stateParams.username,
                  sort_by: $scope.sort_by,
                  sort_by_rating_type: $scope.sort_by_rating_type
              }, function(response) {
                  $scope.total_reviews = response.total;
                  $scope.user_reviews = response.results;
                  $scope.page_user.total_reviews = response.total;
              });
        }

        msgBus.onMsg('review::added', function(e, data){
          getResultsPage(1);
        });

    }]) 
  

  
  ;

'use strict';

angular.module('Filters',[])

.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };

})

.filter('imageFilter', [ function() {
  return function(path, type, size)
  {
    if(!path)
      return '/assets/img/fallback-poster.jpg';

    var image_config = image_path_config;
    
    var s = size || 0;
    var t = type || 'poster';

    return image_config.images.base_url + image_config.images[type + '_sizes'][size] +  path;

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
                'filmkeep\\comment':'commented',
                'filmkeep\\follower':'started following'
                };
    return keys[verb];
  }
})

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
                return (num/2000 * 100) + '%';
            }

            $scope.$on('watchlist::addremove', function(event, film_id) {

              $scope.review.film.on_watchlist = $scope.review.film.on_watchlist === 'true' ? 'false' : 'true';
                    
            });

            $rootScope.$on('review::updated',function(e,review){
              ReviewService.getReview($stateParams.reviewId).then(function(response){
                $scope.rating_types = response.rating_types;
                $scope.review = response.review;
              })
            })


    }]) 

  
  ;


angular.module('Api', ['ngResource'])

.factory('Api', ['$q', '$http', '$resource',
    function($q, $http, $resource) {
      var meData = {};

      function getUrl(path) {
        return '/api' + path;
      }

      function build_resource(path, paramDefaults, actions, options) {
        return $resource(getUrl(path), paramDefaults, actions, options);
      }

      return {
        Reviews: build_resource('/review/:review_id', null, { update: { method:'PUT' }, 'query':{ method: 'GET'}}),
        Notifications: build_resource('/notifications', null, { markSeen: { method:'post', params:{action: "post"} }, 'query':{ method: 'GET', isArray:true}}),
        Comments: build_resource('/comments/:id', null, { update: { method:'PUT' }, 'query':{ method: 'GET'}}),
        RatingTypes: build_resource('/rating_types/:id', null, { update: { method:'PUT', params:{id:'@id'}}, delete: { method:'DELETE', params:{id:'@id'}}, 'query':{ method: 'GET'}}),
        Users: build_resource('/user/:id', null, { update: { method:'PUT', params:{id:'@id'}}, search: { method:'GET'}, 'query':{ method: 'GET', isArray:true}}),
        Lists: build_resource('/rating_types:id', null, {
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
                },
                'addRemove':{
                    method: 'POST',
                    params: {film_id: '@film_id'}
                }
            }),
        getWatchlist: function(user_id) {
            return $http({ method: "get", url: "/api/watchlist", params: { action: "get", user_id: user_id } }).then( handleSuccess, handleError );
        },
        addRemoveWatchlist: function(film_id) {
            return $http({ method: "post", url: "/api/watchlist/add-remove", params: { action: "post", film_id: film_id } }).then( handleSuccess, handleError );
        },
        getAggregated: function() {
            return $http({ method: "get", url: "/api/stream", params: { action: "get", type: 'aggregated' } }).then( handleSuccess, handleError );
        },
        getCompares: function(film_id) {
            return $http({ method: "get", url: "/api/compares", params: { action: "get", film_id: film_id } }).then( handleSuccess, handleError );
        },
        me: function(){
            return $http({ method: "get", url: "/api/me", params: { action: "get" } }).then( function(response){
              meData = response.data;
              return( response.data );
            }, handleError );
        },
        meData: function(){
            return meData;
        },
        isAuthorized: function(){
            return $http({ method: "get", url: "/api/user/isauthorized", params: { action: "get"} }).then( handleSuccess, handleError );
        },
        getFilm: function(tmdb_id) {
            return $http({ method: "get", url: "/api/film", params: { action: "get", tmdb_id: tmdb_id } }).then( handleSuccess, handleError );
        },
        getTrailer: function(tmdb_id) {
            return $http({ method: "get", url: "/api/tmdb/trailer/" + tmdb_id, params: { action: "get", tmdb_id: tmdb_id } }).then( handleSuccess, handleError );
        },
        getNowPlaying: function() {
            return $http({ method: "get", url: "/api/tmdb/nowplaying/", params: { action: "get" } }).then( handleSuccess, handleError );
        },
        follow: function(follower_id){
            return $http({ method: "post", url: "/api/follow/" + follower_id, params: { action: "post", follower_id: follower_id} }).then( handleSuccess, handleError );
        },
        unfollow: function(follower_id){
            return $http({ method: "post", url: "/api/unfollow/" + follower_id, params: { action: "post", follower_id: follower_id} }).then( handleSuccess, handleError );
        },
        getFollowers: function(){
            return $http({ method: "get", url: "/api/followers", params: { action: "get"} }).then( handleSuccess, handleError );
        },
        getWtf: function(){
            return $http({ method: "get", url: "/api/wtf", params: { action: "get"} }).then( handleSuccess, handleError );
        }
      }

      function handleError( response ) {
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );
            }

            return( $q.reject( response.data.message ) );

        }

        function handleSuccess( response ) {
            return( response.data );
        }
    }
])
// .factory('userApiService',
//     function($resource) {
//         return $resource(
//             '/api/user/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 },
//                 'search':{
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )
// .factory('reviewApiService',
//     function($resource) {
//         return $resource(
//             '/api/review/:review_id', {}, // Query parameters
//             {
//                 update: {
//                   method: 'PUT'
//                 },
//                 'query': {
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )

// .factory('ratingTypesApiService',
//     function($resource) {
//         return $resource(
//             '/api/rating_types/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'delete': {
//                   method: 'DELETE', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )

// .factory('listsApiService',
//     function($resource) {
//         return $resource(
//             '/api/lists/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'delete': {
//                   method: 'DELETE', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 },
//                 'addRemove':{
//                     method: 'POST',
//                     params: {film_id: '@film_id'}
//                 }
//             }
//         );
//     }
// )

// .factory('watchlistApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getWatchlist: getWatchlist,
//             addRemoveWatchlist: addRemoveWatchlist
//         });

//         function getWatchlist(user_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/watchlist",
//                 params: {
//                     action: "get",
//                     user_id: user_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function addRemoveWatchlist(film_id) {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/watchlist/add-remove",
//                 params: {
//                     action: "post",
//                     film_id: film_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })



// .factory('notificationsApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getNotifications: getNotifications,
//             markSeen: markSeen
//         });

        

//         function getNotifications() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/notifications",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function markSeen() {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/notifications/seen",
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })



// .factory('streamApiService',
//     function($http, $q) {

//         return({
//             getAggregated: getAggregated,
//         });

//         function getAggregated() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/stream/",
//                 params: {
//                     action: "get",
//                     type: "aggregated",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getFlat() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/stream/",
//                 params: {
//                     action: "get",
//                     type: "flat"
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {

//             return( response.data );

//         }
//     }
// )

// .factory('compareApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getCompares: getCompares
//         });

        

//         function getCompares(film_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/compares",
//                 params: {
//                     action: "get",
//                     film_id: film_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })

// .factory('meApiService',
//     function($http, $q) {
//         var meData = {};

//         return({
//             me: me,
//             meData: getMeData,
//             isAuthorized: isAuthorized
//         });

//         function getMeData(){
//           return meData;
//         }

//         function isAuthorized() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/user/isauthorized",
//                 params: {
//                     action: "get",
//                 }
//             });
//             return( request.then( handleSuccess, handleError ) );

//         }

//         function me() {
            
//             var request = $http({
//                 method: "get",
//                 url: "/api/me",
//                 params: {
//                     action: "get",
//                 }
//             });
//             return( request.then( function(response){
//               meData = response.data;
//               return( response.data );
//             } ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
            
//             return( response.data );

//         }
// })

// .factory('filmApiService',
//     function($http, $q) {

//         return({
//             getFilm: getFilm,
//             getTrailer: getTrailer,
//             getNowPlaying: getNowPlaying
//         });

//         function getFilm(tmdb_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/film",
//                 params: {
//                     action: "get",
//                     tmdb_id: tmdb_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getTrailer(tmdb_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/tmdb/trailer/" + tmdb_id,
//                 params: {
//                     action: "get",
//                     tmdb_id: tmdb_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getNowPlaying() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/tmdb/nowplaying/",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })

// .factory('followApiService',
//     function($http, $q) {

//         return({
//             follow: follow,
//             unfollow: unfollow,
//             getFollowers: getFollowers
//         });

//         function follow(follower_id) {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/follow/" + follower_id,
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function unfollow(follower_id) {
 
//            var request = $http({
//                 method: "post",
//                 url: "/api/unfollow/" + follower_id,
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getFollowers() {
 
//            var request = $http({
//                 method: "get",
//                 url: "/api/followers",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }


//         // I transform the successful response, unwrapping the application data
//         // from the API response payload.
//         function handleSuccess( response ) {

//             return( response.data );

//         }
//     }
// )
// .factory('commentsApiService',
//     function($http, $q) {

//         return({
//             getComments: getComments,
//         });

//         function getComments(type, id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/comments/" ,
//                 params: {
//                     type: type,
//                     id: id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function handleError( response ) {
//           return( response );
//         }

//         function handleSuccess( response ) {
//           return( response );
//         }
//     }
// )

;


'use strict';

angular.module('ReviewService', ['Api'])

.factory('ReviewService', [ '$q','Api',
    function ($q,Api) {

     
        function Review(){

        }

        var types_deferred = $q.defer();
        var reviews_deferred = $q.defer();
        var _types_data = null;

        Api.RatingTypes
            .query({}, function(response) {
                types_deferred.resolve(response.results);
             
            });

        Api.Reviews
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
            return Api.getCompares(film_id);
        }

        Review.getReview = function(review_id)
        { 
            var deferred = $q.defer();
            Api.Reviews
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
        isAuthorized: function (Api) {
            return Api.isAuthorized();
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
      title: 'Settings - sliders',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/filmeters.tmpl.html',
          controller: 'settingsFilmetersCtrl'
        }
      },
    });

  }])

  .controller('settingsCtrl', ['$scope','me','AlertService','$state','Api',
    function ($scope, me,AlertService,$state,Api) {

      $scope.current_user = new Api.Users();
        _.assign($scope.current_user, me.user);
        
      $scope.tabs = [
        {title: 'Profile', state:'root.settings.profile', active:false},
        {title: 'Sliders', state:'root.settings.filmeters', active:false}
      ];

      _.forEach($scope.tabs, function(tab){
        if($state.includes(tab.state))
          tab.active = true;
      });

      $scope.gotoTab = function(dest){
        $state.go(dest);
      }

  }]) 

  .controller('settingsProfileCtrl', ['$scope','me','AlertService','msgBus',
    function ($scope, me,AlertService,msgBus) {
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

  .controller('settingsInvitesCtrl', [
    function () {


  }]) 

  .controller('settingsFilmetersCtrl', ['$scope','me','AlertService','ReviewService','msgBus','Api',
    function ($scope, me,AlertService,ReviewService,msgBus,Api) {
        msgBus.emitMsg('pagetitle::change', "Settings: Sliders");
        

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

  .controller('WatchlistCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','Api','page_user',
    function ($scope,msgBus, $stateParams, ReviewService, Api,page_user) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Watchlist" );

        Api.getWatchlist(page_user.id).then(function(response) {

                $scope.watchlist_items = response.results;
            });

        $scope.htoggle = false;
        

    }]) 

  
  ;
