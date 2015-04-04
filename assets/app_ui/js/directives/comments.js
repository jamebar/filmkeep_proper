
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