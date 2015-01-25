<?php


use Filmkeep\Review;
use Filmkeep\TheMovieDb;
use Filmkeep\Rotten;
use GetStream\StreamLaravel\Enrich;
use Filmkeep\User;
use Filmkeep\Follower;
use Filmkeep\Watchlist;
use Filmkeep\CustomList;

Route::get('/test', function(){

  
  // $gb = new Rotten();
  // $gb_movie = $gb->getMovie('tt0097576');
  // return Response::json($gb_movie);

  // $feed = FeedManager::getNotificationFeed(118);
  // $enricher = new Enrich();
  // $activities = $feed->getActivities(0,25)['results'];
  // $activities = $enricher->enrichAggregatedActivities($activities);
  // return $activities;
  // $data = [
  //     'film_id' => 417,
  //     'user_id' => Auth::user()->id
  //   ];

  //   $results = Watchlist::firstOrCreate($data);
  //   return $results;
  // Enriching
// $enricher = new Enrich();
// $feed = FeedManager::getNewsFeeds(Auth::id())['aggregated'];
// $activities = $feed->getActivities(0,25)['results'];
// $activities = $enricher->enrichAggregatedActivities($activities);
// return  $activities;

// return FeedManager::followUser(1, 1);

  // Deleting activity
  // $api_key = Config::get('stream-laravel::api_key');
  // $api_secret = Config::get('stream-laravel::api_secret');
  // $client = new GetStream\Stream\Client($api_key, $api_secret );
  // $user_feed_1 = $client->feed('user:101');
  // return $user_feed_1->removeActivity("Filmkeep\Follower:27", true);

//   $user_feed_1 = $client->feed('user:101');
// return $user_feed_1.following(0, 10);
  // $data = [
  //     "actor"=>"101",
  //     "verb"=>"review",
  //     "object"=>"547",
  //     "target"=>"1"
  // ];

  // return $user_feed_1->addActivity($data);
//   $payload = array(
//     'message' => array(
//         'subject' => 'Transactional email via Mandrill',
//         'html' => 'It works!',
//         'from_email' => 'james@lemonblock.com',
//         'to' => array(array('email'=>'james@lemonblock.com'))
//     )
// );

// $response = Mandrill::request('messages/send', $payload);
});


// Confide routes
Route::get('users/create', ['as'=>'join', 'uses'=>'AuthController@create']);
Route::post('users', 'AuthController@store');
Route::get('users/login', ['as'=>'login', 'uses'=>'AuthController@login']);
Route::post('users/login', 'AuthController@doLogin');
Route::get('users/confirm/{code}', 'AuthController@confirm');
Route::get('users/forgot_password', ['as'=>'password.remind', 'uses'=>'AuthController@forgotPassword']);
Route::post('users/forgot_password', 'AuthController@doForgotPassword');
Route::get('users/reset_password/{token}', 'AuthController@resetPassword');
Route::post('users/reset_password', 'AuthController@doResetPassword');
Route::get('users/logout', 'AuthController@logout');

Route::get('users/loginfacebook', 'AuthController@loginWithFacebook');
Route::get('users/logingoogle', 'AuthController@loginWithGoogle');
Route::get('users/invite', ['as'=>'invite','uses'=>'InviteController@index']);

/*
* API
*
*/
Route::group(['prefix' => 'api', 'after' => 'allowOrigin'], function($router) {

    $router->get('compares', 'ReviewsController@compares');
    $router->get('review/search', 'ReviewsController@search');
    $router->resource('review', 'ReviewsController');
    $router->get('user/isauthorized', 'AuthController@isAuthorized');
    $router->get('user/search', 'UsersController@search');
    $router->resource('user', 'UsersController');

    $router->resource('lists', 'CustomListsController');
    $router->resource('rating_types', 'RatingTypesController');
    $router->get('followers', 'FollowerController@getFollowers');
    $router->post('follow/{follower_id}', 'FollowerController@follow');
    $router->post('unfollow/{follower_id}', 'FollowerController@unfollow');

    $router->get('watchlist', 'WatchlistController@index');
    $router->post('watchlist/add-remove', 'WatchlistController@addRemove');


    $router->get('notifications', 'NotificationsController@index');
    $router->post('notifications/seen', 'NotificationsController@markSeen');

    $router->get('film', 'FilmController@index');

    $router->get('/tmdb/trailer/{tmdb_id}', function($tmdb_id){
        $t = new TheMovieDb();
        return $t->getFilmTrailer($tmdb_id);
    });

    $router->get('/tmdb/nowplaying', 'FilmController@nowPlaying');
    
    $router->get('/tmdb/{query}', function($query){
        $t = new TheMovieDb();
        return $t->searchTmdb($query);
    });

    $router->get('/stream/', 'StreamController@index');

    $router->get('/me', function(){
      if(Auth::guest())
        return Response::json(['response'=>'false']);

      $user = User::with('followers')->where('id',Auth::user()->id)->first();
      return Response::json(['user'=> $user, 'response'=>'success']);
    });

    $router->get('/wtf', function(){
      $wtf = file_get_contents('https://googledrive.com/host/0B-hfdwkYlYLCVklJcHBUMzV6d0E/wtf.html');
      return Response::json(['results'=> $wtf]);
    });


});

Route::any('/', ['as' =>'home', 'uses'=> 'HomeController@index']);
Route::any('{all}', ['uses'=> 'HomeController@index'])->where('all', '.*');
//

App::bind('confide.user_validator', 'Filmkeep\Validators\UserValidator');
