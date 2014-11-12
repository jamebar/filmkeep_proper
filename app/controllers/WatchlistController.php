<?php

use Filmkeep\Watchlist;
use Filmkeep\User;

class WatchlistController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
    $user_id = \Input::get('user_id');
		$watchlist = Watchlist::with('film')->where('user_id', $user_id)->orderBy('list_order', 'asc')->orderby('created_at','asc')->get();
    return \Response::json(['status' => 200, 'results' => $watchlist]);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function addRemove()
	{
   
    $film_id = \Input::get('film_id');
    $user_id = \Auth::user()->id;
    $action = 'added';

    $results = Watchlist::where('film_id', $film_id)->where('user_id', $user_id)->first();

    if ( ! is_null($results))
    {
      $results->delete();
      $action = 'removed';
    }
    else
    {
      $results = Watchlist::create(['user_id'=>$user_id, 'film_id'=>$film_id]);
    }


		return Response::json(['action'=>$action]);
	}



}
