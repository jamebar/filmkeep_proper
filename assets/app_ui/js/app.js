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



.controller('wrapperCtrl', ['$scope','$rootScope','msgBus','meApiService','notificationsApiService','$modal','wtfApiService',
    function($scope,$rootScope,msgBus,meApiService,notificationsApiService,$modal,wtfApiService) {


      msgBus.onMsg('user::loaded', function(e, data){
        $scope.header_user = data;
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

      $scope.featureList = function(){
          $scope.featurePreloader = true;
          var featureInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_wtf.tmpl.html',
          
            });

          wtfApiService.getWtf().then(function(response){
            var results = response.results.split('|');
            $scope.todos = results[0].split(',');
            $scope.done = results[1].split(',');
            $scope.featurePreloader = false;
          });
        }

    }
  
])
.controller('appCtrl', ['$sce','msgBus','$scope','$rootScope','$modal','ReviewService','$timeout','reviewApiService','me','watchlistApiService','Slug','filmApiService','listsApiService','wtfApiService',
    function($sce,msgBus,$scope,$rootScope,$modal,ReviewService,$timeout,reviewApiService,me,watchlistApiService,Slug,filmApiService,listsApiService,wtfApiService) {
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



        $scope.addRemoveToList = function(list_id, film_id, action)
        {
          var list = new listsApiService();
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
            return (num/2000 * 100) + '%';
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

.directive('textMore', [ function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      textMore: '@',
    },
    template: '%%textMore | limitTo: max_length%%<a ng-click="max_length=1000000" ng-show="textMore.length > max_length ">... read more</a><a ng-click="max_length=max" ng-show="textMore.length < max_length && textMore.length > max"> <i class="glyphicon glyphicon-chevron-left" style="font-size:.8em"></i> less </a>',
    link: function(scope, element,attrs) {
        scope.max = attrs.max || 75;
        scope.max_length = scope.max;
    }
  }
}])

.directive('filmObject', ['$rootScope','watchlistApiService','msgBus','meApiService','Slug',function($rootScope,watchlistApiService,msgBus,meApiService,Slug) {
  return {
    restrict: 'E',
    scope:{
      film: '=film',
      review: '=review',
      horizontal: '@'
    },
    replace: true,
    templateUrl: '/assets/templates/film_object.tmpl.html',
    link: function(scope, element,attrs) {

        scope.me = meApiService.meData();


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