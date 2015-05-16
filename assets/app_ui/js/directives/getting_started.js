
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