<?php

use Filmkeep\User;
use Filmkeep\Review;
use Filmkeep\Comment;
use Filmkeep\Watchlist;

class CommentsController extends \BaseController {

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index()
  {
    $type = Input::get('type');
    $type_id = Input::get('type_id');
    $object = $this->klass($type,$type_id);
    if($object)
      return ['results'=> $object->comments->load('user')];
    else
      return [];
  }

  public function show($id)
  {
    Response::json( Comment::find($id) );
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
    
    $user = User::find(Auth::user()->id);
    $type = Input::get('type');
    $type_id = Input::get('type_id');
    $spoiler = Input::has('spoiler') ? '1' : '0';
    $comment = new Comment(['comment'=> Input::get('description'),
                            'user_id'=> $user->id,
                            'film_id'=> Input::get('film_id'),
                            'spoiler'=> Input::has('spoiler'),
                            ]);
    
    //send notification to each user on this comment thread

    $object = $this->klass($type,$type_id);
    if($object)
      return $object->comments()->save($comment)->load('user');
    else
      return [];
  }

  public function destroy($id)
  {
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    $c = Comment::where('id', $id)->where('user_id', Auth::user()->id)->first()->delete();

    return \Response::json(['status' => 200, 'results'=> $c]);

  }

  private function klass($type, $id)
  {
    switch($type){
      case 'review':
      return Review::find($id);
      break;
      case 'watchlist':
      return Watchlist::find($id);
      break;
    }
    
  }

 
}