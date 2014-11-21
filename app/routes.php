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
  // $client = new GetStream\Stream\Client('4j8dz2dp5vjn', '3gzp62asbcwjxjyfx7yvrbmctxykwrqc27ypxvnj7xyfu7uygz9rcrdshmvb4fey');
  // $user_feed_1 = $client->feed('user:101');
  // $user_feed_1->removeActivity("0c846400-6713-11e4-8080-80012c455820");

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



/*
* API
*
*/
Route::group(['prefix' => 'api', 'after' => 'allowOrigin'], function($router) {

    $router->get('compares', 'ReviewsController@compares');
    $router->get('review/search', 'ReviewsController@search');
    $router->resource('review', 'ReviewsController');
    $router->get('user/search', 'UsersController@search');
    $router->resource('user', 'UsersController');

    $router->resource('rating_types', 'RatingTypesController');
    $router->get('followers', 'FollowerController@getFollowers');
    $router->post('follow/{follower_id}', 'FollowerController@follow');
    $router->post('unfollow/{follower_id}', 'FollowerController@unfollow');

    $router->get('watchlist', 'WatchlistController@index');
    $router->post('watchlist/add-remove', 'WatchlistController@addRemove');

    $router->get('film', 'FilmController@index');

    $router->get('/tmdb/{query}', function($query){
        $t = new TheMovieDb();
        return $t->searchTmdb($query);
    });

    $router->get('/stream/', 'StreamController@index');

    $router->get('/me', function(){
      if(Auth::guest())
        return Response::json(['response'=>'false']);

      $user = User::with('followers')->where('id',Auth::user()->id)->select(array('id', 'username','name','email','avatar','created_at'))->first();
      return Response::json(['user'=> $user, 'response'=>'success']);
    });

});

Route::any('{all}', ['as' =>'home', 'uses'=> 'HomeController@index'])->where('all', '.*');
//

App::bind('confide.user_validator', 'Filmkeep\Validators\UserValidator');
