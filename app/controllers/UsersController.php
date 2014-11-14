<?php

use Filmkeep\User;
use Filmkeep\Follower;

class UsersController extends BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		
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
		//
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{

    if(\Input::has('username'))
    {
      $user = User::with('followers')->where('username', $id)->first();
      $user->total_followers = Follower::where('follower_id', $user->id)->count();
      return $user;
    }
		  

    return User::with('followers')->find($id);

	}

  /**
   * Search for users.
   *
   * @param  string $query
   * @return Response
   */
  public function search()
  {
      $query = \Input::get('query');
      $users = User::where('first_name', 'LIKE', '%'.$query.'%')->orWhere('last_name', 'LIKE', '%'.$query.'%')->take(3)->get();     
      return Response::json(['results'=>$users, 'query'=>$query]);

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
