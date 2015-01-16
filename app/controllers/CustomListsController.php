<?php

use Filmkeep\CustomList;

class CustomListsController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
    
		$user_id = \Input::has('user_id') ? \Input::get('user_id') : Auth::user()->id;
    $list = CustomList::where('user_id', $user_id);
    if(\Input::has('with_films'))
      $list->with('films');

    return \Response::json(['status' => 200, 'results' => $list->get()]);
	}

  public function addRemove()
  {
    
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    $film_id = \Input::get('film_id');
    $user_id = \Auth::user()->id;
    $list_id = \Input::get('id');
    $action = \Input::get('action');
    $c = CustomList::find($list_id);

    if ( ! is_null($c))
    {
      switch( \Input::get('action') )
      {
        case 'add':
        $c->films()->attach($film_id);
        return Response::json('added');
        break;

        case 'remove':
        $c->films()->detach($film_id);
        return Response::json('removed');
        break;
      }
    }

     return Response::json('invalid list');

  }

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    if(\Input::has('film_id'))
      return $this->addRemove();

		$data=[
      'user_id' => Auth::user()->id,
      'name'=> \Input::get('name'),
      'description'=> \Input::has('description') ? \Input::get('description') : ''
      ];

    return CustomList::create($data);
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return CustomList::find($id)->with('films')->get();
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$c = CustomList::find($id);

    $data=[
      'name'=> \Input::get('name'),
      'description'=> \Input::get('description')
      ];

    if( $c->update($data) )
    {

        return Response::json($c);
    }
    else
    {
        return Response::json("fail");
    }

	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
    if( CustomList::find($id)->deleteList() )
    {

        return Response::json("success");
    }
    else
    {
        return Response::json("fail");
    }
	}


}
