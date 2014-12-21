
  'use strict';

  angular.module('settings', [
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root.settings', {
      abstract: true,
      url: '/settings',
      title: 'Settings',
      views: {
        'page' : {
          templateUrl: '/assets/templates/settings/settings.tmpl.html',
          controller: 'settingsCtrl'
        }
      },
    });

    $stateProvider.state('root.settings.profile', {
      url: '/profile',
      title: 'Settings - profile',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/profile.tmpl.html',
          controller: 'settingsProfileCtrl'
        }
      },
    });
    $stateProvider.state('root.settings.filmeters', {
      url: '/filmeters',
      title: 'Settings - filmeters',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/filmeters.tmpl.html',
          controller: 'settingsFilmetersCtrl'
        }
      },
    });

  }])

  .controller('settingsCtrl', ['$scope','me','userApiService','AlertService','$state',
    function ($scope, me,userApiService,AlertService,$state) {
      $scope.current_user = new userApiService();
        _.assign($scope.current_user, me.user);
        
      $scope.tabs = [
        {title: 'Profile', state:'root.settings.profile', active:false},
        {title: 'Filmeters', state:'root.settings.filmeters', active:false}
      ];

      _.forEach($scope.tabs, function(tab){
        if($state.includes(tab.state))
          tab.active = true;
      });

      $scope.gotoTab = function(dest){
        $state.go(dest);
      }

  }]) 

  .controller('settingsProfileCtrl', ['$scope','me','userApiService','AlertService',
    function ($scope, me,userApiService,AlertService) {
        

        $scope.saveUser = function(){
          $scope.current_user.$update(function(response){
              AlertService.Notice("Your changes have been saved");
              _.assign(me.user, response);
          },function(response_headers){
              AlertService.Warning(response_headers.data);
          });
        }

  }]) 

  .controller('settingsInvitesCtrl', ['$scope','me','userApiService','AlertService',
    function ($scope, me,userApiService,AlertService) {

  }]) 

  .controller('settingsFilmetersCtrl', ['$scope','me','userApiService','AlertService','ratingTypesApiService','ReviewService',
    function ($scope, me,userApiService,AlertService,ratingTypesApiService,ReviewService) {
        $scope.newcriteria = new ratingTypesApiService();
        ReviewService.getRatingTypes().then(function(results){
          $scope.types = results;
            
        });

        $scope.filterCommon = function(element) {
          return element.user_id === 0 ? true : false;
        };

        $scope.filterCustom = function(element) {
          return element.user_id !== 0 ? true : false;
        };

        $scope.saveFilmeter = function(){
          $scope.newcriteria.$save(function(response){
            $scope.types.push(response);
            $scope.newcriteria = new ratingTypesApiService();

          });
        }

        $scope.deleteFilmeter = function(meter){
          var filmeter = new ratingTypesApiService();
        
          filmeter.id = meter.id;
          filmeter.$delete(function(response){
            $scope.types  = response.results;
            ReviewService.setRatingTypes(response.results);
          });
        }

  }]) 

  .directive('pwCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }])
   

  
  ;
