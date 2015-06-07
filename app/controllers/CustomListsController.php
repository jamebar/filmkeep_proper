<?php

use Filmkeep\CustomList;
use Filmkeep\Film;

class CustomListsController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');
    
		$user_id = \Input::has('user_id') ? \Input::get('user_id') : Auth::user()->id;
    $list = CustomList::where('user_id', $user_id)->orderBy('name','asc');
    if(\Input::has('with_films'))
      $list->with('films');

    return \Response::json(['status' => 200, 'results' => $list->get()]);
	}

  public function addRemove()
  {
    
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    if(\Input::has('tmdb_id'))
    {
      $f = new Film();
      $film = $f->digestFilm(\Input::get('tmdb_id'));
    }
    $film_id = \Input::has('film_id') ? \Input::get('film_id') : $film->id;
    $sort_order = \Input::get('sort_order');
    $user_id = \Auth::user()->id;
    $list_id = \Input::get('list_id');
    $action = \Input::get('list_action');

    if ( $c = CustomList::where('id',$list_id)->where('user_id', $user_id)->first() )
    {
      switch( $action )
      {
        case 'add':
        if (!$c->films->contains($film_id)) {
          $c->films()->attach($film_id);
          $c->films()->updateExistingPivot($film_id, ['sort_order'=> $sort_order], false);
        }
        return Response::json($c->films()->get());
        break;

        case 'remove':
        $c->films()->detach($film_id);
        $ids = array_pluck($c->films()->get(), 'id');
        $c->setSortOrder($ids);
        return Response::json($c->films()->get());
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
    $list = CustomList::with('films', 'user')->where('id',$id)->first();
    $all = [];
    if(\Input::has('include_all'))
      $all = CustomList::where('user_id', $list['user_id'])->get();

    return Response::json(['list'=>$list, 'all' => $all]);
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$c = CustomList::with('films')->where('id',$id)->first();

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
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function updateSortOrder()
  {
    $list_id = \Input::get('list_id');
    $ordered_ids = explode( ',', \Input::get('ordered_ids'));
    $c = CustomList::with('films')->where('id',$list_id)->first();
    $c->setSortOrder($ordered_ids);
    
    return Response::json($c->films()->orderBy('film_list.sort_order', 'asc')->get());

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
