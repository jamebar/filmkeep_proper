'use strict';

angular.module('Api', ['ngResource'])

.factory('reviewApiService',
    function($resource) {
        return $resource(
            '/api/review/:review_id', {}, // Query parameters
            {
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

.factory('ratingTypesApiService',
    function($resource) {
        return $resource(
            '/api/rating_types', {}, // Query parameters
            {
                'query': {
                    method: 'GET'
                }
            }
        );
    }
)

;

