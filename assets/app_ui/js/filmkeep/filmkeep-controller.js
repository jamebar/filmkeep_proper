
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
        page_user: ['Api','$stateParams','$q',function(Api, $stateParams, $q){
          var deferred = $q.defer();
          Api.Users
            .get({id:$stateParams.username,username:true}, function(response){
              deferred.resolve(response);

            });
          return deferred.promise;
        }]
      }
    });

    $stateProvider.state('root.user.filmkeep', {
      url: '',
      title: 'filmkeep',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/filmkeep.tmpl.html',
          controller: 'FilmkeepCtrl'
        }
      },
    });

    $stateProvider.state('root.user.filmkeep2', {
      url: '/filmkeep',
      title: 'filmkeep',
       views: {
        'page-child' : {
          template: '',
          controller: ['$stateParams','$state',function($stateParams,$state){
            $state.go('root.user.filmkeep', {username: $stateParams.username });
          }]
        }
      },
    });

    
  }])

  .controller('userCtrl', ['$scope', 'msgBus', '$stateParams','ReviewService','followerFactory','me','page_user','Api',
    function ($scope, msgBus, $stateParams, ReviewService, followerFactory,  me, page_user, Api) {
        
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
            Api.unfollow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }else{

            page_user.following = true;
            Api.follow(page_user.id).then(function(response){
              me.user.followers = response.followers;
            });

          }

        }

    }]) 

    .controller('FilmkeepCtrl', ['$scope', 'msgBus','$stateParams','ReviewService','followerFactory','Api',
    function ($scope, msgBus,$stateParams, ReviewService, followerFactory, Api ) {
        msgBus.emitMsg('pagetitle::change', $scope.page_user.name + "'s Filmkeep" );
        $scope.user_reviews = [];
        $scope.total_reviews = 0;
        $scope.reviews_per_page = 24; // this should match however many results your API puts on one page
        
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
          Api.Reviews
              .query({
                  num: $scope.reviews_per_page,
                  page: pageNumber,
                  username: $stateParams.username,
                  sort_by: $scope.sort_by,
                  sort_by_rating_type: $scope.sort_by_rating_type
              }, function(response) {
                  $scope.total_reviews = response.total;
                  $scope.user_reviews = response.results;
                  $scope.page_user.total_reviews = response.total;
              });
        }

        msgBus.onMsg('review::added', function(e, data){
          getResultsPage(1);
        });

    }]) 
  

  
  ;
