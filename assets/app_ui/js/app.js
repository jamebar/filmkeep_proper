/*global _ */
/*global moment*/

'use strict';

angular.module('myApp', [
    'ui.router',
    'ui.bootstrap',
    'vr.directives.slider',
    'Api',
    'ngAnimate',
    'siyfion.sfTypeahead',
    'ae-review',
    'review'
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    //$urlRouterProvider.otherwise('/review');

    
}])

.controller('appCtrl', ['$scope','msgBus','$modal',
    function($scope,msgBus,$modal) {

        $scope.editReview = function(id){
             openModal(id);
            
           
        }

        $scope.newReview = function(){
            

            
            openModal(false);
        }

        function openModal(id){
            var modalInstance = $modal.open({
                templateUrl: 'assets/templates/add_review.tmpl.html',
              
            });

            modalInstance.opened.then(function () {
               
              if(id){
                setTimeout(function(){
                    msgBus.emitMsg('review:edit', {'id': id});
                },500);
               
              }
              else
              {
                msgBus.emitMsg('review:new');
              }
            }, function () {
             
            });
        }
        
    }
])



.factory('msgBus', ['$rootScope', function($rootScope) {
    var msgBus = {};
    msgBus.emitMsg = function(msg, data) {
        data = data || {}
        $rootScope.$emit(msg, data);
    };
    msgBus.onMsg = function(msg, func, scope) {
        var unbind = $rootScope.$on(msg, func);
        if (scope) {
            scope.$on('$destroy', unbind);
        }
    };
    return msgBus;
}])
;