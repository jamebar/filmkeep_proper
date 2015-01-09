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
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider','$stateProvider','$urlRouterProvider', function($locationProvider, $stateProvider,$urlRouterProvider) {

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
      label: '='
    },
    template: '<span>%%labelLeft%%<span ng-show="labelRight" class="pull-right">%%labelRight%%</span><span ng-show="rating_type.new">(New)</span>',
    link: function(scope, element,attrs) {
        
        var labels = scope.label.split("|");
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