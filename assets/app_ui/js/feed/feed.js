
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

.controller('feedCtrl', ['$scope', 'streamApiService','me', 'ReviewService','reviewApiService','Slug',
  function($scope, streamApiService,me,ReviewService,reviewApiService,Slug){
    $scope.loading = true;
    $scope.me = me;
    $scope.review_new = new reviewApiService();

    ReviewService.getRatingTypes().then(function(results){
      $scope.rating_types_new = results;
        
    });

    $scope.slugify = function(input) {
        // console.log('slugified');
        return Slug.slugify(input);
    };

    $scope.$on('watchist::addremove', function(event, film_id) {

        _.forEach($scope.feed_items, function(feed_item){
          _.forEach(feed_item.activities, function(activity){
            if(activity.object.film_id === film_id)
            {
              activity.object.on_watchlist = activity.object.on_watchlist === 'true' ? 'false' : 'true';
            }
            
          })
        })
    });

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
    return moment(date).fromNow(true);
  }
})