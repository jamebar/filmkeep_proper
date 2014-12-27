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
		return Response::json(['results'=>'store']);
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
      $user = User::with('followers')->where('username', $id)->select(array('id', 'username','name','avatar'))->first();
      $user->total_followers = Follower::where('follower_id', $user->id)->count();
      $user->total_following = Follower::where('user_id', $user->id)->count();
      $user->total_reviews = $user->reviews? $user->reviews->count() : 0;
      $user->total_watchlist = $user->watchlist? $user->watchlist->count() : 0;
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
      $users = User::where('name', 'LIKE', '%'.$query.'%')->take(3)->get();     
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
    $rules = array(
      'email' => 'required|unique:users,email,' . Input::get('id'),
      'username' => 'required|unique:users,username,' . Input::get('id'),
      'password' => 'sometimes|required|min:4'
      );
    $validator = Validator::make(Input::all(), $rules);
    if ($validator->fails())
    {
      return Response::make($validator->messages(), 400);
      
    }
    $user = User::find( Auth::user()->id);
    $user->email = Input::get('email');
    $user->username = Input::get('username');
    $user->name = Input::get('name');

    if(\Input::has('password'))
      $user->password =  Input::get('password');

    if(\Input::has('password_confirmation'))
      $user->password_confirmation =  Input::get('password_confirmation');

    $user->save();

    return Response::json($user);
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
