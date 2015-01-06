<?php
 
 
class InviteController extends BaseController {
 
  public function index()
  {
    if(Input::has('invite')){
      return Redirect::to('/users/create?invite='. Input::get('invite'));
    }

    return View::make('auth.invite');
  }
 
}