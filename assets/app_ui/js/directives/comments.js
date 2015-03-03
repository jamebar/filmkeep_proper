
  'use strict';

  angular.module('fk.comments', [
])

  .directive('comments', [
    function(){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/comment_form.tmpl.html',
            link: function(scope, element, attrs) {


            }

        }
    }
  ]);