
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