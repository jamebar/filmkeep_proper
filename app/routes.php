<?php

use Filmkeep\Review;
use Filmkeep\TheMovieDb;

Route::get('/test', function(){
   $t = new TheMovieDb();
   $q = \Input::get('q');
   return $t->searchTmdb($q);
});

Route::get('/', function(){
	return View::make('home');
});

Route::get('/login', ['as' => 'login', 'uses' => 'Auth\AuthController@getLogin']);
Route::post('/login', 'Auth\AuthController@postLogin');

Route::get('/logout', ['as' => 'logout', 'uses' => 'Auth\AuthController@getLogout']);

Route::get('/register', ['as' => 'register', 'uses' => 'Auth\AuthController@getRegister']);
Route::post('/register', 'Auth\AuthController@postRegister');

Route::get('/loginFacebook', ['as'=>'loginFacebook', 'uses' => 'Auth\AuthController@getLoginFacebook']);
//post('/auth/loginFacebook', ['uses' => 'Auth\AuthController@getLoginFacebook']);



Route::group(['prefix' => 'api', 'after' => 'allowOrigin'], function($router) {

    $router->resource('review', 'ReviewsController');
    $router->resource('rating_types', 'RatingTypesController');
    $router->get('/tmdb/{query}', function($query){
        $t = new TheMovieDb();
        return $t->searchTmdb($query);
    });

});