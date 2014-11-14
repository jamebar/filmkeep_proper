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

.controller('appCtrl', ['$scope','msgBus','$modal','ReviewService','$timeout','reviewApiService','me','watchlistApiService',
    function($scope,msgBus,$modal,ReviewService,$timeout,reviewApiService,me,watchlistApiService) {
       
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
          $scope.showcompare = false;
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

            response = _.sortBy(response, function(r) { return r.active });

            var me_review = _.remove(response, function(r){ return r.user_id === me.user.id});
            response.unshift(me_review[0]);
            $scope.compares = response;

            $scope.showcompare = true;
            
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

        $scope.watchlist = function(obj)
        {
          //obj.on_watchlist = obj.on_watchlist === 'true' ? 'false' : 'true';

          $scope.$broadcast('watchist::addremove', obj.film_id);

          watchlistApiService
            .addRemoveWatchlist(obj.film_id).then(function(response) {

                console.log(response);
                
            });
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