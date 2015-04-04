
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
      resolve: {
        isAuthorized: function (Api) {
            return Api.isAuthorized();
        } 
      },
      onEnter: function(isAuthorized){
        if(isAuthorized == 0)
          window.location.href = '/users/login';
      }
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
      title: 'Settings - sliders',
      views: {
        'page-child' : {
          templateUrl: '/assets/templates/settings/filmeters.tmpl.html',
          controller: 'settingsFilmetersCtrl'
        }
      },
    });

  }])

  .controller('settingsCtrl', ['$scope','me','AlertService','$state','Api',
    function ($scope, me,AlertService,$state,Api) {

      $scope.current_user = new Api.Users();
        _.assign($scope.current_user, me.user);
        
      $scope.tabs = [
        {title: 'Profile', state:'root.settings.profile', active:false},
        {title: 'Sliders', state:'root.settings.filmeters', active:false}
      ];

      _.forEach($scope.tabs, function(tab){
        if($state.includes(tab.state))
          tab.active = true;
      });

      $scope.gotoTab = function(dest){
        $state.go(dest);
      }

  }]) 

  .controller('settingsProfileCtrl', ['$scope','me','AlertService','msgBus',
    function ($scope, me,AlertService,msgBus) {
        msgBus.emitMsg('pagetitle::change', "Settings: Profile");

        $scope.saveUser = function(){
          $scope.current_user.$update(function(response){
              AlertService.Notice("Your changes have been saved");
              _.assign(me.user, response);
          },function(response_headers){
              AlertService.Warning(response_headers.data);
          });
        }

  }]) 

  .controller('settingsInvitesCtrl', [
    function () {


  }]) 

  .controller('settingsFilmetersCtrl', ['$scope','me','AlertService','ReviewService','msgBus','Api',
    function ($scope, me,AlertService,ReviewService,msgBus,Api) {
        msgBus.emitMsg('pagetitle::change', "Settings: Sliders");
        $scope.newcriteria = new Api.RatingTypes();
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
            $scope.newcriteria = new Api.RatingTypes();

          });
        }

        $scope.updateFilmeter = function(type){
          var t = new Api.RatingTypes();
          _.assign(t,type);
          t.$update(function(response){
            AlertService.Notice("Your slider is updated");
            type.orig = type.label;
            type.edit = false;
          })
        }

        $scope.deleteFilmeter = function(meter){
          var filmeter = new Api.RatingTypes();
        
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
   
   .directive('ngReallyClick', ['$modal',
        function($modal) {

          var ModalInstanceCtrl = function($scope, $modalInstance) {
            $scope.ok = function() {
              $modalInstance.close();
            };

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
          };

          return {
            restrict: 'A',
            scope: {
              ngReallyClick:"&"
            },
            link: function(scope, element, attrs) {
              element.bind('click', function() {
                var message = attrs.ngReallyMessage || "Are you sure ?";

                var modalHtml = '<div class="modal-body"><p>' + message + '</p></div>';
                modalHtml += '<div class="modal-footer"><button class="btn btn-success" ng-click="ok()">OK</button><button class="btn btn-default" ng-click="cancel()">Cancel</button></div>';

                var modalInstance = $modal.open({
                  template: modalHtml,
                  controller: ModalInstanceCtrl,
                  size:'sm'
                });

                modalInstance.result.then(function() {
                  scope.ngReallyClick();
                }, function() {
                  //Modal dismissed
                });
                
              });

            }
          }
        }
      ])

  
  ;
