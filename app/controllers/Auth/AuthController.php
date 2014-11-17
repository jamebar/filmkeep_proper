<?php namespace Auth;

use App\User;


class AuthController  extends \BaseController{

  /**
   * Login user with facebook
   *
   * @return void
   */
  public function loginWithFacebook() {

    // get data from input
    $code = \Input::get( 'code' );

    // get fb service
    $fb = \OAuth::consumer( 'Facebook' );

    // check if code is valid

    // if code is provided get user data and sign in
    if ( !empty( $code ) ) {

      // This was a callback request from facebook, get the token
      $token = $fb->requestAccessToken( $code );

      // Send a request with it
      $result = json_decode( $fb->request( '/me' ), true );

      //search for user in database by facebook id
      if ( isset( $result['id'] ) ) {
        $user = \User::where( 'facebook_id' , $result['id'] )->first();

        //If user is found in DB, log them in and update the profile pic
        if ( $user ) {
          \Auth::login( $user , true );

          if ( \Auth::check() ) {
            //add profile pic if doesn't exist
            if ( strlen( $user->avatar ) < 2 ) {
              $user->avatar = "http://graph.facebook.com/".$result['username']."/picture?width=250&height=250";
              $user->save();
            }
            return \Redirect::to( '/fk/'. \Auth::user()->username )
            ->with( 'flash_notice', 'You are successfully logged in.' );
          }
        }
        else {
          $route = "home";
          //check if email already exists
          $user = \User::where( 'email' , $result['email'] )->first();

          //if email exists, add the facebook id and login the user
          if ( $user ) {
            $user->facebook_id      = $result['id'];
            $user->save();
          }
          else {
            //This is a new user, check to see if invite info exists in session
            if ( Session::has( 'invite_info' ) ) {
              //session info exists, add new user with facebook info
              $user = new \User;
              $user->first_name         = $result['first_name'];
              $user->last_name         = $result['last_name'];
              $user->username     = $result['username'];
              $user->email        = $result['email'];
              $user->facebook_id      = $result['id'];
              $user->avatar    = "http://graph.facebook.com/".$result['username']."/picture?width=250&height=250";
              $user->save();

              //append id to username to assure it's unique
              $user->username = $user->username . "_" . $user->id;
              $user->save();

              //set invite to redeemed and update user
              $my_invite = \Session::get( 'invite_info' );
              $my_invite = \Invite::find( $my_invite['id'] );
              $my_invite->redeemed = 1;
              $my_invite->redeemer_user_id = $user->id;
              $my_invite->save();

              // login user
              \Auth::login( $user , true );

              // build message with some of the resultant data
              $message_notice = 'Welcome to Filmkeep, your account is created.';

              // redirect to profile page
              return \Redirect::to( '/'. $user->username )
              ->with( 'flash_notice', $message_notice );
            }



            //This is a new user, we'll store their info in session
            // and verify their invite code


            $new_user = array(
              "first_name"        => $result['first_name'],
              "last_name"        => $result['last_name'],
              "username"    => $result['username'],
              "email"       => $result['email'],
              "facebook_id"   => $result['id'],
              "avatar"   => "http://graph.facebook.com/".$result['username']."/picture?width=250&height=250"

            );
            \Session::put( 'new_user', $new_user );
            return \Redirect::to( '/user/invite' );

          }

          \Auth::login( $user , true );

          return \Redirect::to( '/'. $user->username )
          ->with( 'flash_notice', 'Welcome to Filmkeep '.$result["name"] );
        }



      }


    }
    // if not ask for permission first
    else {
      // get fb authorization
      $url = $fb->getAuthorizationUri();

      // return to facebook login url
      return \Response::make( '', 302 )->header( 'Location', (string)$url );
    }

  }



  public function loginWithGoogle() {

    // get data from input
    $code = Input::get( 'code' );

    // get google service
    $googleService = OAuth::consumer( 'Google' );

    // check if code is valid

    // if code is provided get user data and sign in
    if ( !empty( $code ) ) {

      // This was a callback request from google, get the token
      $token = $googleService->requestAccessToken( $code );

      // Send a request with it
      $result = json_decode( $googleService->request( 'https://www.googleapis.com/oauth2/v1/userinfo' ), true );

      //search for user in database by facebook id
      if ( isset( $result['id'] ) ) {
        $user = User::where( 'google_id' , $result['id'] )->first();

        //print_r($user);
        //Auth::loginUsingId($user['id']);
        if ( $user ) {
          Auth::login( $user , true );

          if ( Auth::check() ) {
            //add profile pic if doesn't exist
            if ( strlen( $user->profile_pic ) < 2 ) {
              $user->profile_pic = $result['picture'];
              $user->save();
            }
            return Redirect::to( '/'. Auth::user()->username )
            ->with( 'flash_notice', 'You are successfully logged in.' );
          }
        }
        else {
          //check if email already exists
          $user = User::where( 'email' , $result['email'] )->first();

          //if email exists, add the google id and login the user
          if ( $user ) {
            $user->google_id    = $result['id'];
            $user->save();
          }
          else {
            //add user to database
            // store
            $user = new User;
            $user->name         = $result['name'];
            $user->username     = substr( $result['email'], 0, strpos( $result['email'], '@' ) );
            $user->email        = $result['email'];
            $user->google_id    = $result['id'];
            $user->profile_pic    = $result['picture'];
            $user->save();

            //append id to username to assure it's unique
            $user->username = $user->username . "_" . $user->id;
            $user->save();
          }




          Auth::login( $user , true );

          return Redirect::to( '/'. $user->username )
          ->with( 'flash_notice', 'Welcome to Filmkeep '.$result["name"] );
        }



      }


    }
    // if not ask for permission first
    else {
      // get googleService authorization
      $url = $googleService->getAuthorizationUri();

      // return to facebook login url
      return Redirect::to( (string)$url );
    }
  }

  /**
   * Store a newly created user in storage.
   *
   * @return Response
   */
  public function store() {
    // validate
    // read more on validation at http://laravel.com/docs/validation
    $rules = array(
      'fullname'       => 'required',
      'email'      => 'required|email',
      'password' => 'required|min:6'
    );
    $validator = \Validator::make( \Input::all(), $rules );

    // process the login
    if ( $validator->fails() ) {

      return \Redirect::route( 'join' )
      ->withErrors( $validator )
      ->withInput( \Input::except( 'password' ) );
    } else {

      $user = \User::where( 'email' , \Input::get( 'email' ) )->first();

      if ( !$user ) {
        // store\
        $name = explode(" ", \Input::get( 'fullname' ));
        $user = new \User;
        $user->first_name       = $name[0];
        $user->last_name       = isset($name[1]) ? $name[1] : '' ;
        $user->email      = \Input::get( 'email' );
        $user->password = \Hash::make( \Input::get( 'password' ) );
        $user->save();


        //search for username to assure uniqueness
        $possibleUsername = strtolower($user->first_name . $user->last_name);
        $searchUser = \User::where('username', $possibleUsername)->first();

        if(is_null($searchUser)){
          $user->username = $possibleUsername;
        }else{
          //append id to username to assure it's unique
          $user->username = $possibleUsername . $user->id;
        }
        $user->save();

        \Auth::login( $user );

        // redirect
        \Session::flash( 'flash_notice', 'Welcome to Filmkeep!' );
        return \Redirect::route( 'home' );
      }
      else {
        \Session::flash( 'flash_error', 'A user with this email already exists.' );
        return \Redirect::route( 'join' );

      }

    }
  }





  public function login() {
    return \View::make( 'auth.login' );
  }

  public function join( $invite_code =null ) {
    //echo $invite_code;
    $email = \Input::get( 'email' );

    if ( $invite_code != null &&  $email != null ) {
      $invite_info = \Invite::where( 'code', $invite_code )
      ->where( 'email', $email )
      ->first();
      //dd( $invite_info->toArray() );


      if ( empty( $invite_info ) || $invite_info->redeemed == 1 ) {
        //redirect to login page if invite isn't found or it's been redeemed already
        \Session::flash( 'flash_error', 'That invite code has already been redeemed or is not valid anymore.' );
        return \View::make( 'auth.join' );
      }

      //invite exists and has not been redeemed.  Store it in a session and send them to join
      $invite_info = $invite_info->toArray();
      \Session::put( 'invite_info', $invite_info );
      return \View::make( 'auth.join', $invite_info );
    }


    \Session::flush();
    return \View::make( 'auth.join' );
  }

  public function update() {

  }

  public function invite() {
    if ( Session::has( 'new_user' ) ) {
      return \View::make( 'auth.invite', Session::get( 'new_user' ) );

    }
    else {
      return Redirect::route( 'join' );
    }

  }

}
