
angular.module('Api', ['ngResource'])

.factory('Api', ['$q', '$http', '$resource',
    function($q, $http, $resource) {
      var meData = {};

      function getUrl(path) {
        return '/api' + path;
      }

      function build_resource(path, paramDefaults, actions, options) {
        return $resource(getUrl(path), paramDefaults, actions, options);
      }

      return {
        Reviews: build_resource('/review/:review_id', null, { update: { method:'PUT' }, 'query':{ method: 'GET'}}),
        Notifications: build_resource('/notifications', null, { markSeen: { method:'post', params:{action: "post"} }, 'query':{ method: 'GET', isArray:true}}),
        Comments: build_resource('/comments/:id', null, { update: { method:'PUT' }, 'query':{ method: 'GET', isArray:true}}),
        RatingTypes: build_resource('/rating_types/:id', null, { update: { method:'PUT', params:{id:'@id'}}, delete: { method:'DELETE', params:{id:'@id'}}, 'query':{ method: 'GET'}}),
        Users: build_resource('/user/:id', null, { update: { method:'PUT', params:{id:'@id'}}, search: { method:'GET'}, 'query':{ method: 'GET', isArray:true}}),
        Lists: build_resource('/rating_types:id', null, {
                'update': {
                  method: 'PUT', 
                  params: {id: '@id'},
                },
                'delete': {
                  method: 'DELETE', 
                  params: {id: '@id'},
                },
                'query': {
                    method: 'GET'
                },
                'addRemove':{
                    method: 'POST',
                    params: {film_id: '@film_id'}
                }
            }),
        getWatchlist: function(user_id) {
            return $http({ method: "get", url: "/api/watchlist", params: { action: "get", user_id: user_id } }).then( handleSuccess, handleError );
        },
        addRemoveWatchlist: function(film_id) {
            return $http({ method: "post", url: "/api/watchlist/add-remove", params: { action: "post", film_id: film_id } }).then( handleSuccess, handleError );
        },
        getAggregated: function() {
            return $http({ method: "get", url: "/api/stream", params: { action: "get", type: 'aggregated' } }).then( handleSuccess, handleError );
        },
        getCompares: function(film_id) {
            return $http({ method: "get", url: "/api/compares", params: { action: "get", film_id: film_id } }).then( handleSuccess, handleError );
        },
        me: function(){
            return $http({ method: "get", url: "/api/me", params: { action: "get" } }).then( function(response){
              meData = response.data;
              return( response.data );
            }, handleError );
        },
        meData: function(){
            return meData;
        },
        isAuthorized: function(){
            return $http({ method: "get", url: "/api/user/isauthorized", params: { action: "get"} }).then( handleSuccess, handleError );
        },
        getFilm: function(tmdb_id) {
            return $http({ method: "get", url: "/api/film", params: { action: "get", tmdb_id: tmdb_id } }).then( handleSuccess, handleError );
        },
        getTrailer: function(tmdb_id) {
            return $http({ method: "get", url: "/api/tmdb/trailer/" + tmdb_id, params: { action: "get", tmdb_id: tmdb_id } }).then( handleSuccess, handleError );
        },
        getNowPlaying: function() {
            return $http({ method: "get", url: "/api/tmdb/nowplaying/", params: { action: "get" } }).then( handleSuccess, handleError );
        },
        follow: function(follower_id){
            return $http({ method: "post", url: "/api/follow/" + follower_id, params: { action: "post", follower_id: follower_id} }).then( handleSuccess, handleError );
        },
        unfollow: function(follower_id){
            return $http({ method: "post", url: "/api/unfollow/" + follower_id, params: { action: "post", follower_id: follower_id} }).then( handleSuccess, handleError );
        },
        getFollowers: function(){
            return $http({ method: "get", url: "/api/followers", params: { action: "get"} }).then( handleSuccess, handleError );
        },
        getWtf: function(){
            return $http({ method: "get", url: "/api/wtf", params: { action: "get"} }).then( handleSuccess, handleError );
        }
      }

      function handleError( response ) {
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );
            }

            return( $q.reject( response.data.message ) );

        }

        function handleSuccess( response ) {
            return( response.data );
        }
    }
])
// .factory('userApiService',
//     function($resource) {
//         return $resource(
//             '/api/user/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 },
//                 'search':{
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )
// .factory('reviewApiService',
//     function($resource) {
//         return $resource(
//             '/api/review/:review_id', {}, // Query parameters
//             {
//                 update: {
//                   method: 'PUT'
//                 },
//                 'query': {
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )

// .factory('ratingTypesApiService',
//     function($resource) {
//         return $resource(
//             '/api/rating_types/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'delete': {
//                   method: 'DELETE', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 }
//             }
//         );
//     }
// )

// .factory('listsApiService',
//     function($resource) {
//         return $resource(
//             '/api/lists/:id', {}, // Query parameters
//             {
//                 'update': {
//                   method: 'PUT', 
//                   params: {id: '@id'},
//                 },
//                 'delete': {
//                   method: 'DELETE', 
//                   params: {id: '@id'},
//                 },
//                 'query': {
//                     method: 'GET'
//                 },
//                 'addRemove':{
//                     method: 'POST',
//                     params: {film_id: '@film_id'}
//                 }
//             }
//         );
//     }
// )

// .factory('watchlistApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getWatchlist: getWatchlist,
//             addRemoveWatchlist: addRemoveWatchlist
//         });

//         function getWatchlist(user_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/watchlist",
//                 params: {
//                     action: "get",
//                     user_id: user_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function addRemoveWatchlist(film_id) {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/watchlist/add-remove",
//                 params: {
//                     action: "post",
//                     film_id: film_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })



// .factory('notificationsApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getNotifications: getNotifications,
//             markSeen: markSeen
//         });

        

//         function getNotifications() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/notifications",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function markSeen() {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/notifications/seen",
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })



// .factory('streamApiService',
//     function($http, $q) {

//         return({
//             getAggregated: getAggregated,
//         });

//         function getAggregated() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/stream/",
//                 params: {
//                     action: "get",
//                     type: "aggregated",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getFlat() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/stream/",
//                 params: {
//                     action: "get",
//                     type: "flat"
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {

//             return( response.data );

//         }
//     }
// )

// .factory('compareApiService',
//     function($http, $q) {
//         var data;

//         return({
//             getCompares: getCompares
//         });

        

//         function getCompares(film_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/compares",
//                 params: {
//                     action: "get",
//                     film_id: film_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })

// .factory('meApiService',
//     function($http, $q) {
//         var meData = {};

//         return({
//             me: me,
//             meData: getMeData,
//             isAuthorized: isAuthorized
//         });

//         function getMeData(){
//           return meData;
//         }

//         function isAuthorized() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/user/isauthorized",
//                 params: {
//                     action: "get",
//                 }
//             });
//             return( request.then( handleSuccess, handleError ) );

//         }

//         function me() {
            
//             var request = $http({
//                 method: "get",
//                 url: "/api/me",
//                 params: {
//                     action: "get",
//                 }
//             });
//             return( request.then( function(response){
//               meData = response.data;
//               return( response.data );
//             } ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
            
//             return( response.data );

//         }
// })

// .factory('filmApiService',
//     function($http, $q) {

//         return({
//             getFilm: getFilm,
//             getTrailer: getTrailer,
//             getNowPlaying: getNowPlaying
//         });

//         function getFilm(tmdb_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/film",
//                 params: {
//                     action: "get",
//                     tmdb_id: tmdb_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getTrailer(tmdb_id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/tmdb/trailer/" + tmdb_id,
//                 params: {
//                     action: "get",
//                     tmdb_id: tmdb_id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getNowPlaying() {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/tmdb/nowplaying/",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }

//         function handleSuccess( response ) {
//             return( response.data );

//         }
// })

// .factory('followApiService',
//     function($http, $q) {

//         return({
//             follow: follow,
//             unfollow: unfollow,
//             getFollowers: getFollowers
//         });

//         function follow(follower_id) {
 
//             var request = $http({
//                 method: "post",
//                 url: "/api/follow/" + follower_id,
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function unfollow(follower_id) {
 
//            var request = $http({
//                 method: "post",
//                 url: "/api/unfollow/" + follower_id,
//                 params: {
//                     action: "post",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function getFollowers() {
 
//            var request = $http({
//                 method: "get",
//                 url: "/api/followers",
//                 params: {
//                     action: "get",
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         // ---
//         // PRIVATE METHODS.
//         // ---


//         // I transform the error response, unwrapping the application dta from
//         // the API response payload.
//         function handleError( response ) {

//             // The API response from the server should be returned in a
//             // nomralized format. However, if the request was not handled by the
//             // server (or what not handles properly - ex. server error), then we
//             // may have to normalize it on our end, as best we can.
//             if (
//                 ! angular.isObject( response.data ) ||
//                 ! response.data.message
//                 ) {

//                 return( $q.reject( "An unknown error occurred." ) );

//             }

//             // Otherwise, use expected error message.
//             return( $q.reject( response.data.message ) );

//         }


//         // I transform the successful response, unwrapping the application data
//         // from the API response payload.
//         function handleSuccess( response ) {

//             return( response.data );

//         }
//     }
// )
// .factory('commentsApiService',
//     function($http, $q) {

//         return({
//             getComments: getComments,
//         });

//         function getComments(type, id) {
 
//             var request = $http({
//                 method: "get",
//                 url: "/api/comments/" ,
//                 params: {
//                     type: type,
//                     id: id
//                 }
//             });

//             return( request.then( handleSuccess, handleError ) );

//         }

//         function handleError( response ) {
//           return( response );
//         }

//         function handleSuccess( response ) {
//           return( response );
//         }
//     }
// )

;

