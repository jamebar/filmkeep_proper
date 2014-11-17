<?php 

use Filmkeep\Rating_type;
use Filmkeep\User;

class RatingTypesController extends BaseController{

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        $rating_types = Rating_type::where('user_id', 0);

        if( Auth::check() )
        {
            $rating_types->orWhere('user_id', Auth::user()->id);
        }
            

		return \Response::json(['status' => 200, 'results'=>$rating_types->get()]);
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
    $user = User::find(Auth::user()->id);

    $type = new Rating_type(['label'=> Input::get('label')]);
    return $user->rating_types()->save($type);

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
		Rating_type::where('id', $id)->where('user_id', Auth::user()->id)->first()->delete();

    $rating_types = Rating_type::where('user_id', 0)->orWhere('user_id', Auth::user()->id);

    return \Response::json(['status' => 200, 'results'=>$rating_types->get()]);

    //and delete all ratings that have to do with it
	}

}
