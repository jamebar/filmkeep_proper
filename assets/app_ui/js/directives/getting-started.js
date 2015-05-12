
  'use strict';

  angular.module('getting-started', [
])

  .directive('followFriends', ['Api',
    function(Api){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/getting_started/follow_friends.tmpl.html',
            link: function(scope, element, attrs) {
              Api.Users.query(function(response){
                scope.users = response;
              });
            }

        }
    }
  ]);