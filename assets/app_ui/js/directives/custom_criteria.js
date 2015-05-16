
  'use strict';

  angular.module('custom-criteria', [
])

  .directive('customCriteria', ['AlertService','ReviewService','msgBus','Api',
    function(AlertService,ReviewService,msgBus,Api){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/custom_criteria.tmpl.html',
            link: function($scope, element, attrs) {
              var me = Api.me();
              $scope.common = attrs.common || false;
              $scope.custom = attrs.custom || true;

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


            }

        }
    }
  ]);