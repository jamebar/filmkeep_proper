<?php


use Filmkeep\Review;
use Filmkeep\TheMovieDb;
use Filmkeep\Rotten;
use GetStream\StreamLaravel\Enrich;
use Filmkeep\User;
use Filmkeep\Follower;
use Filmkeep\Watchlist;
use Filmkeep\CustomList;
use Filmkeep\Comment;
use Filmkeep\Announcement;

Route::get('/test', function(){
  $apikey = 'f39589d9c877cecbe4032052979da1aa';
  $tmdb = new \TMDb($apikey,'en');
  $t = $tmdb->getMovie(76757, 'en', 'releases');
  $value = array_first($t['releases']['countries'], function($key, $value)
    {
        return $value['iso_3166_1'] == 'US';
    });

  return $value['certification'];
  // $api_key = 'dppcz8n6xmkc';
  // $api_secret = 'a4ze5h59su875zxuthz3je7xxz4cf23g9aqtbwzs3vc7gtr2rxx6rcezqs8eapsj';
  // $client = new GetStream\Stream\Client($api_key, $api_secret );
  // $user_feed25 = $client->feed("user","25");
  // $user_feed4 = $client->feed("aggregated","4");
  // $user_feed4->followFeed('user', '25');
  
  // return $user_feed25->followers(0, 50);
  // $r = Review::find(16);
  // $r->comments()->save( new Comment(['user_id'=>'117', 'comment'=>'this is a test','spoiler'=> false]) );
  // $gb = new Rotten();
  // $gb_movie = $gb->getMovie('tt0097576');
  // return Response::json($gb_movie);

  // $feed = FeedManager::getNewsFeeds(117)['flat'];
  // $enricher = new Enrich();
  // $activities = $feed->getActivities(0,25)['results'];
  // $activities = $enricher->enrichActivities($activities);
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

Route::get('refresh-films/{film_id?}', 'FilmController@refresh');

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
Route::get('users/invite', ['as'=>'invite','before'=>'guest', 'uses'=>'InviteController@index']);

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

    $router->resource('comments', 'CommentsController');

    $router->resource('lists', 'CustomListsController');
    $router->resource('lists/add-remove', 'CustomListsController@addRemove');
    $router->resource('lists/sort-order', 'CustomListsController@updateSortOrder');
    $router->resource('rating_types', 'RatingTypesController');
    $router->get('followers', 'FollowerController@getFollowers');
    $router->post('follow/{follower_id}', 'FollowerController@follow');
    $router->post('unfollow/{follower_id}', 'FollowerController@unfollow');

    $router->get('watchlist', 'WatchlistController@index');
    $router->post('watchlist/add-remove', 'WatchlistController@addRemove');


    $router->get('notifications', 'NotificationsController@index');
    $router->post('notifications', 'NotificationsController@markSeen');

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
      $user["new"] = $user->reviews->count() < 1;
      $announcements = Announcement::where('is_active', true)->orderBy('created_at', 'desc')->get();

      //feed creds
      $api_key = Config::get('stream-laravel::api_key');
      $api_secret = Config::get('stream-laravel::api_secret');
      $client = new GetStream\Stream\Client($api_key, $api_secret );
      $agg_feed = $client->feed('aggregated', Auth::id() );
      $notif_feed = $client->feed('notification', Auth::id() );
      $stream['agg_token'] = $agg_feed->getToken();
      $stream['notif_token'] = $notif_feed->getToken();
      $stream['key'] = $api_key;
      $stream['id'] = Config::get('stream-laravel::api_site_id');

      return Response::json(['user'=> $user, 'response'=>'success', 'announcements' => $announcements, 'stream' => $stream]);
    });

    $router->get('/wtf', function(){
      $wtf = file_get_contents('https://googledrive.com/host/0B-hfdwkYlYLCVklJcHBUMzV6d0E/wtf.html');
      return Response::json(['results'=> $wtf]);
    });


});

Route::any('/', ['as' =>'home','before'=>'guest', 'uses'=> 'HomeController@index']);
Route::any('{all}', ['uses'=> 'HomeController@index'])->where('all', '.*');
//

App::bind('confide.user_validator', 'Filmkeep\Validators\UserValidator');
