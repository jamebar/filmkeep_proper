
  'use strict';

  angular.module('filmkeep', ['angularUtils.directives.dirPagination'
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.user', {
      abstract:true,
      url: '/u/{username}',
      title: 'filmkeep',
      views: {
        'page' : {
          templateUrl: '/assets/templates/user.tmpl.html',
          controller: 'userCtrl'
        }
      },

      resolve: {
        page_user: function(userApiService, $stateParams, $q){
          var deferred = $q.defer();
          userApiService
            .get({id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);

            });
          return deferred.promise;
        }
      }
    });

    $stateProvider.state('root.user.filmkeep', {
      url: '/filmkeep',
      title: 'filmkeep',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      },
    });

    
  }])

  .controller('userCtrl', ['$scope', 'msgBus', '$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory','me','page_user',
    function ($scope, msgBus,$stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory,  me, page_user) {
        
        $scope.user_reviews = [];
        $scope.total_reviews = 0;

        page_user.following = followerFactory.isFollowing(page_user);

        if(angular.isDefined(me.user))
          $scope.myPage = page_user.id === me.user.id;

        $scope.showFollow = angular.isDefined(me.user) && !$scope.myPage;

        $scope.page_user = page_user; 
                
        $scope.follow = function(page_user){

          if(page_user.following){

            //make change immediately, should be in callback, but it's too slow
            page_user.following = false;
            followApiService.unfollow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }else{

            page_user.following = true;
            followApiService.follow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }

        }

    }]) 

    .controller('FilmkeepCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','userApiService','reviewApiService','followApiService','followerFactory',
    function ($scope, msgBus,$stateParams, ReviewService, userApiService, reviewApiService, followApiService, followerFactory  ) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Filmkeep" );
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 20; // this should match however many results your API puts on one page
        
        $scope.sort_by = 'created_at'
        $scope.sort_by_rating_type = 'null';
        getResultsPage(1);

        ReviewService.getRatingTypes().then(function(response){
          $scope.rating_types = response;
          
        });

        $scope.pagination = {
            current: 1
        };

        $scope.pageChanged = function(newPage) {
            getResultsPage(newPage);
        };

        $scope.sortByRatingType = function(type_id){
          $scope.sort_by_rating_type = type_id;
          // getResultsPage(1);
          if($scope.pagination.current === 1)
            getResultsPage(1);
          else
            $scope.pagination.current = 1;
          
        }

        function getResultsPage(pageNumber) {
          reviewApiService
              .query({
                  num: $scope.reviews_per_page,
                  page: pageNumber,
                  username: $stateParams.username,
                  sort_by: $scope.sort_by,
                  sort_by_rating_type: $scope.sort_by_rating_type
              }, function(response) {
                  $scope.total_reviews = response.total;
                  $scope.user_reviews = response.results;
                  
              });
        }

    }]) 
  

  
  ;
