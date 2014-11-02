<?php

use Filmkeep\Review;
use Filmkeep\TheMovieDb;

Route::get('/test', function(){
   $t = new TheMovieDb();
   $q = \Input::get('q');
   return $t->searchTmdb($q);
});

Route::get('/', ['as' =>'home'], function(){
	return View::make('home');
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

App::missing(function($exception)
{
    return View::make('home');
});

/*
* API
*
*/
Route::group(['prefix' => 'api', 'after' => 'allowOrigin'], function($router) {

    $router->resource('review', 'ReviewsController');
    $router->resource('user', 'UsersController');
    $router->resource('rating_types', 'RatingTypesController');
    $router->get('/tmdb/{query}', function($query){
        $t = new TheMovieDb();
        return $t->searchTmdb($query);
    });

});