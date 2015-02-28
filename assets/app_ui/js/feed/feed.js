
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

.controller('feedCtrl', ['$scope', 'msgBus','streamApiService','me', 'ReviewService','reviewApiService','watchlistApiService','filmApiService','listsApiService',
  function($scope, msgBus,streamApiService,me,ReviewService,reviewApiService,watchlistApiService,filmApiService,listsApiService){
    msgBus.emitMsg('pagetitle::change', 'My Feed' );
    $scope.loading = true;
    $scope.me = me;

    ReviewService.getRatingTypes().then(function(results){
      $scope.rating_types_new = results;
        
    });

    var lists = new listsApiService();
    lists.$query({with_films:true}).then(function(results){
      $scope.lists = results.results;
    })

    filmApiService.getNowPlaying().then(function(response){
      $scope.now_playing = response;
    })

    watchlistApiService
            .getWatchlist(me.user.id).then(function(response) {
                $scope.watchlist_items = response.results;
            });
    $scope.releaseDate = function(d){
      return moment(d).format('YYYY');
    }

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
        return (num/2000 * 100) + '%';
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