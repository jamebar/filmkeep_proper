<?php


use Filmkeep\Review;
use Filmkeep\TheMovieDb;
use GetStream\StreamLaravel\Enrich;
use Filmkeep\User;
use Filmkeep\Follower;
use Filmkeep\Watchlist;

Route::get('/test', function(){

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

    $router->resource('rating_types', 'RatingTypesController');
    $router->get('followers', 'FollowerController@getFollowers');
    $router->post('follow/{follower_id}', 'FollowerController@follow');
    $router->post('unfollow/{follower_id}', 'FollowerController@unfollow');

    $router->get('watchlist', 'WatchlistController@index');
    $router->post('watchlist/add-remove', 'WatchlistController@addRemove');

    $router->get('film', 'FilmController@index');

    $router->get('/tmdb/trailer/{tmdb_id}', function($tmdb_id){
        $t = new TheMovieDb();
        return $t->getFilmTrailer($tmdb_id);
    });
    
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


});

Route::any('/', ['as' =>'home', 'uses'=> 'HomeController@index']);
Route::any('{all}', ['uses'=> 'HomeController@index'])->where('all', '.*');
//

App::bind('confide.user_validator', 'Filmkeep\Validators\UserValidator');
