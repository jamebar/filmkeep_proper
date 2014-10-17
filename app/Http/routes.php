<?php

use App\Review;
use App\TheMovieDb;

$router->get('/test', function(){
   $t = new TheMovieDb();
   $q = \Input::get('q');
   return $t->searchTmdb($q);
});

$router->get('/', function(){
	return View('home');
});

get('/auth/login', ['as' => 'login', 'uses' => 'Auth\AuthController@getLogin']);
post('/auth/login', 'Auth\AuthController@postLogin');

get('/auth/logout', ['as' => 'logout', 'uses' => 'Auth\AuthController@getLogout']);

get('/auth/register', ['as' => 'register', 'uses' => 'Auth\AuthController@getRegister']);
post('/auth/register', 'Auth\AuthController@postRegister');

get('/auth/loginFacebook', ['as'=>'loginFacebook', 'uses' => 'Auth\AuthController@getLoginFacebook']);
//post('/auth/loginFacebook', ['uses' => 'Auth\AuthController@getLoginFacebook']);



$router->group(['prefix' => 'api', 'after' => 'allowOrigin'], function($router) {

    $router->resource('reviews', 'ReviewsController');
    $router->resource('rating_types', 'RatingTypesController');
    $router->get('/tmdb/{query}', function($query){
        $t = new TheMovieDb();
        return $t->searchTmdb($query);
    });

});