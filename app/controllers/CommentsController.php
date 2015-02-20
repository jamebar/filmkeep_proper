<?php

use Filmkeep\User;
use Filmkeep\Review;
use Filmkeep\Comment;

class CommentsController extends \BaseController {

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index()
  {
    $type = Input::get('type');
    $type_id = Input::get('id');
    $object = $this->klass($type,$type_id);
    if($object)
      return $object->comments->load('user');
    else
      return [];
  }


  /**
   * Store a newly created resource in storage.
   *
   * @return Response
   */
  public function store()
  {
    $user = User::find(Auth::user()->id);
    $type = Input::get('type');
    $type_id = Input::get('id');
    $comment = new Comment(['comment'=> Input::get('comment'),
                            'user_id'=> $user->id,
                            'spoiler'=> Input::get('spoiler'),
                            ]);
    
    $object = $this->klass($type,$type_id);
    if($object)
      return $object->comments()->save($comment);
    else
      return [];
  }

  private function klass($type, $id)
  {
    switch($type){
      case 'review':
      return Review::find($id);
      break;
    }
    
  }

 
}