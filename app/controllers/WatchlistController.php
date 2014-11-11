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
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		//
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
    $data = [
      'film_id' => \Input::get('film_id'),
      'user_id' => Auth::user()->id
    ];

    $results = Watchlist::firstOrCreate($data);
		return $results;
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
	}


	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}


}
