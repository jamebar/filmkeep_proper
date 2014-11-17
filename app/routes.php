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



/*
* 
* Routes within this group require authentication
*
*
*/
Route::group(array('before' => 'Auth'), function()
{

  Route::get('user/logout', array('as' => 'logout', function () {
      Auth::logout();

      return Redirect::route('login')
          ->with('flash_notice', 'You are successfully logged out.');
  }));

});

/*
* 
* Routes within this group require that you are a guest
*
*
*/
Route::group(array('before' => 'guest'), function()
{
  Route::get('user/login', array('as' => 'login', 'uses' => 'Auth\AuthController@login'));
  Route::get('user/join/{invite_code?}', array('as' => 'join',  'uses' => 'Auth\AuthController@join'));
    Route::get('user/invite', array('as' => 'invite',  'uses' => 'Auth\AuthController@invite'));
});
/*
* 
* Login/Signup routes
*
*
*/
Route::post('user/join', array('uses' => 'Auth\AuthController@store'));
Route::get('user/loginWithFacebook', array('as' => 'facebooklogin', 'uses' => 'Auth\AuthController@loginWithFacebook'));
Route::get('user/loginWithGoogle', array('as' => 'googlelogin', 'uses' => 'Auth\AuthController@loginWithGoogle'));
Route::post('user/login', function () {
        $user = array(
            'email' => Input::get('email'),
            'password' => Input::get('password')
        );
        
        if (Auth::attempt($user , true)) {
            return Redirect::to('/' . Auth::user()->username)
                ->with('flash_notice', 'You are successfully logged in.');
        }
        
        // authentication failure! lets go back to the login page
        return Redirect::route('login')
            ->with('flash_error', 'Your username/password combination was incorrect.')
            ->withInput();
});

/*
* 
* Routes for password reset
*
*
*/
Route::get('password/reset', array(
  'uses' => 'PasswordController@remind',
  'as' => 'password.remind'
));
Route::post('password/reset', array(
  'uses' => 'PasswordController@request',
  'as' => 'password.request'
));
Route::get('password/reset/{token}', array(
  'uses' => 'PasswordController@reset',
  'as' => 'password.reset'
));
Route::post('password/reset/{token}', array(
  'uses' => 'PasswordController@update',
  'as' => 'password.update'
));


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

Route::any('{all}', ['as' =>'home', 'uses'=> 'HomeController@index'])->where('all', '.*');
