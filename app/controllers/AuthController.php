<?php

use Filmkeep\User;
use Filmkeep\Invite;

/**
 * AuthController Class
 *
 * Implements actions regarding user management
 */
class AuthController extends Controller
{

    function isAuthorized(){
      return Auth::check() ? 1 : 0;
    }
    /**
     * Displays the form for account creation
     *
     * @return  Illuminate\Http\Response
     */
    public function create()
    {
        $code = Input::has('invite') ? Input::get('invite') : 'dontfind';
        $invite = Invite::where('code', $code)->first();
        
        if(is_null($invite)){
         return Redirect::to('/users/invite')->with('message','You must have a valid invite code to join');
        }
        
        return View::make('auth.join');
    }

    /**
     * Login user with facebook
     *
     * @return void
     */
    public function loginWithFacebook() {

        // get data from input
        $code = Input::get( 'code' );

        // get fb service
        $fb = OAuth::consumer( 'Facebook' );

        // check if code is valid

        // if code is provided get user data and sign in
        if ( !empty( $code ) ) {

            // This was a callback request from facebook, get the token
            $token = $fb->requestAccessToken( $code );

            // Send a request with it
            $result = json_decode( $fb->request( '/me' ), true );

            $user = User::where('facebook_id' , $result['id'] )->orWhere('email', $result['email'])->first();

            //If user is found in DB, log them in and update the profile pic
            if($user)
            {
              Auth::login( $user , true);
              
              if (Auth::check())
              {
                
                $user->facebook_id = $result['id'];

                //add profile pic if doesn't exist
                if( strlen($user->avatar) < 2)
                {
                  $user->avatar = "http://graph.facebook.com/".$result['id']."/picture?width=250&height=250";
                  
                }
                $user->save();
                return Redirect::to('/feed')
                            ->with('message', 'Welcome back ' . $user->name);
              }
            }
            else
            {
                $random_password = md5(uniqid(mt_rand(), true));
                $repo = App::make('UserRepository');
                $input = [
                  'name' => $result['name'],
                  'email'=> $result['email'],
                  'facebook_id' => $result['id'],
                  'confirmed' => 1,
                  'password'=> $random_password, //we set random password so confide doesn't fail
                  'password_confirmation'=> $random_password, //we set random password so confide doesn't fail
                  'avatar' => "http://graph.facebook.com/".$result['id']."/picture?width=250&height=250"
                ];
                $user = $repo->signup($input);
                
                if ($user->id) {
                  Auth::login($user);
                  return Redirect::to('/feed')
                  ->with('message', 'Welcome to Filmkeep, ' . $user->name);
                } else {
                $error = $user->errors()->all(':message');

                return Redirect::action('AuthController@create')
                    ->withInput(Input::except('password'))
                    ->with('error', $error);
                }
                

            }
            
        }
        // if not ask for permission first
        else {
            // get fb authorization
            $url = $fb->getAuthorizationUri();

            // return to facebook login url
             return Redirect::to( (string)$url );
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
            $user = User::where('google_id' , $result['id'] )->orWhere('email', $result['email'])->first();
            //If user is found in DB, log them in and update the profile pic
            if($user)
            {
              Auth::login( $user , true);
              
              if (Auth::check())
              {
                
                $user->google_id = $result['id'];

                //add profile pic if doesn't exist
                if( strlen($user->avatar) < 2)
                {
                  $user->avatar = $result['picture'];
                  
                }
                $user->save();
                return Redirect::to('/feed')
                            ->with('message', 'Welcome back ' . $user->name);
              }
            }
            else
            {
                $random_password = md5(uniqid(mt_rand(), true));
                $repo = App::make('UserRepository');
                $input = [
                  'name' => $result['name'],
                  'email'=> $result['email'],
                  'google_id' => $result['id'],
                  'confirmed' => 1,
                  'password'=> $random_password, //we set random password so confide doesn't fail
                  'password_confirmation'=> $random_password, //we set random password so confide doesn't fail
                  'avatar' => $result['picture']
                ];

                $user = $repo->signup($input);
                if ($user->id) {
                  Auth::login($user);
                  return Redirect::to('/feed')
                  ->with('message', 'Welcome to Filmkeep, ' . $user->name);
                } else {
                $error = $user->errors()->all(':message');

                return Redirect::action('AuthController@create')
                    ->withInput(Input::except('password'))
                    ->with('error', $error);
                }
                

            }
            

        }
        // if not ask for permission first
        else {
            // get googleService authorization
            $url = $googleService->getAuthorizationUri();

            // return to google login url
            return Redirect::to( (string)$url );
        }
    }

    /**
     * Stores new account
     *
     * @return  Illuminate\Http\Response
     */
    public function store()
    {

        $repo = App::make('UserRepository');
        $user = $repo->signup(Input::all());
        if ($user->id) {
            if (Config::get('confide::signup_email')) {
                Mail::queueOn(
                    Config::get('confide::email_queue'),
                    Config::get('confide::email_account_confirmation'),
                    compact('user'),
                    function ($message) use ($user) {
                        $message
                            ->to($user->email, $user->username)
                            ->subject(Lang::get('confide::confide.email.account_confirmation.subject'));
                    }
                );
            }

            Auth::login($user);
            return Redirect::to('/feed')
                ->with('notice', Lang::get('confide::confide.alerts.account_created'));
        } else {
            $error = $user->errors()->all(':message');

            return Redirect::action('AuthController@create')
                ->withInput(Input::except('password'))
                ->with('error', $error);
        }
    }

    /**
     * Displays the login form
     *
     * @return  Illuminate\Http\Response
     */
    public function login()
    {
        if (Confide::user()) {
            return Redirect::to('/feed');
        } else {
            return View::make('auth.login');
        }
    }

    /**
     * Attempt to do login
     *
     * @return  Illuminate\Http\Response
     */
    public function doLogin()
    {
        $repo = App::make('UserRepository');
        $input = Input::all();

        if ($repo->login($input)) {
            return Redirect::intended('/feed');
        } else {
            if ($repo->isThrottled($input)) {
                $err_msg = Lang::get('confide::confide.alerts.too_many_attempts');
            } elseif ($repo->existsButNotConfirmed($input)) {
                $err_msg = Lang::get('confide::confide.alerts.not_confirmed');
            } else {
                $err_msg = Lang::get('confide::confide.alerts.wrong_credentials');
            }

            return Redirect::action('AuthController@login')
                ->withInput(Input::except('password'))
                ->with('error', $err_msg);
        }
    }

    /**
     * Attempt to confirm account with code
     *
     * @param  string $code
     *
     * @return  Illuminate\Http\Response
     */
    public function confirm($code)
    {
        if (Confide::confirm($code)) {
            $notice_msg = Lang::get('confide::confide.alerts.confirmation');
            return Redirect::action('AuthController@login')
                ->with('notice', $notice_msg);
        } else {
            $error_msg = Lang::get('confide::confide.alerts.wrong_confirmation');
            return Redirect::action('AuthController@login')
                ->with('error', $error_msg);
        }
    }

    /**
     * Displays the forgot password form
     *
     * @return  Illuminate\Http\Response
     */
    public function forgotPassword()
    {
        return View::make(Config::get('confide::forgot_password_form'));
    }

    /**
     * Attempt to send change password link to the given email
     *
     * @return  Illuminate\Http\Response
     */
    public function doForgotPassword()
    {
        if (Confide::forgotPassword(Input::get('email'))) {
            $notice_msg = Lang::get('confide::confide.alerts.password_forgot');
            return Redirect::action('AuthController@login')
                ->with('notice', $notice_msg);
        } else {
            $error_msg = Lang::get('confide::confide.alerts.wrong_password_forgot');
            return Redirect::action('AuthController@doForgotPassword')
                ->withInput()
                ->with('error', $error_msg);
        }
    }

    /**
     * Shows the change password form with the given token
     *
     * @param  string $token
     *
     * @return  Illuminate\Http\Response
     */
    public function resetPassword($token)
    {
        return View::make(Config::get('confide::reset_password_form'))
                ->with('token', $token);
    }

    /**
     * Attempt change password of the user
     *
     * @return  Illuminate\Http\Response
     */
    public function doResetPassword()
    {
        $repo = App::make('UserRepository');
        $input = array(
            'token'                 =>Input::get('token'),
            'password'              =>Input::get('password'),
            'password_confirmation' =>Input::get('password_confirmation'),
        );

        // By passing an array with the token, password and confirmation
        if ($repo->resetPassword($input)) {
            $notice_msg = Lang::get('confide::confide.alerts.password_reset');
            return Redirect::action('AuthController@login')
                ->with('notice', $notice_msg);
        } else {
            $error_msg = Lang::get('confide::confide.alerts.wrong_password_reset');
            return Redirect::action('AuthController@resetPassword', array('token'=>$input['token']))
                ->withInput()
                ->with('error', $error_msg);
        }
    }

    /**
     * Log the user out of the application.
     *
     * @return  Illuminate\Http\Response
     */
    public function logout()
    {
        Confide::logout();

        return Redirect::to('/');
    }


}
