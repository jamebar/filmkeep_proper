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
    'review',
    'filmkeep',
    'feed'
], function($interpolateProvider) {
    $interpolateProvider.startSymbol('%%');
    $interpolateProvider.endSymbol('%%');
})

.run(['$rootScope','$state','$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams; 
}])

.config(['$locationProvider', function($locationProvider) {

  $locationProvider.html5Mode(true);

}])

.controller('appCtrl', ['$scope','msgBus','$modal','ReviewService','$timeout','reviewApiService',
    function($scope,msgBus,$modal,ReviewService,$timeout,reviewApiService) {
        $scope.review = new reviewApiService();
        ReviewService.getRatingTypes().then(function(results){
                $scope.rating_types = results;
                
            });

        $scope.getReview = function(review) {
            if (typeof review === 'object') {
                console.log('didnt make api call');
                $scope.review = review.review;
                $scope.rating_types = review.rating_types;
                showModal();

            } else {
                ReviewService.getReview(review).then(function(results) {
                   // console.log(results);
                    $scope.review = results.review;
                    $scope.rating_types = results.rating_types;
                    showModal();

                })
            }

            $scope.ae_button_label = "Update";
        }

        function showModal(){
            var modalInstance = $modal.open({
                scope: $scope,
                templateUrl: '/assets/templates/modal_review.tmpl.html',
          
            });
        }
        

        $scope.editReview = function(id){
            $scope.getReview(id);
            //openModal(id);

        }

        $scope.newReview = function(){
   
            $scope.review = new reviewApiService();
            showModal();
            
                
        }

        // function openModal(id){
        //     var modalInstance = $modal.open({
        //         templateUrl: 'assets/templates/add_review.tmpl.html',
              
        //     });

        //     modalInstance.opened.then(function () {
               
        //       if(id){
        //         setTimeout(function(){
        //             msgBus.emitMsg('review:edit', {'id': id});
        //         },500);
               
        //       }
        //       else
        //       {
        //         msgBus.emitMsg('review:new');
        //       }
        //     }, function () {
             
        //     });
        // }
        
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