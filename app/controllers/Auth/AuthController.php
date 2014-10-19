<?php namespace App\Http\Controllers\Auth;

use App\User;
use Illuminate\Contracts\Auth\Authenticator;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;

use Laravel\Socialite\Contracts\Factory as SocialiteFactory;

class AuthController  {

	/**
	 * The authenticator implementation.
	 *
	 * @var Authenticator
	 */
	protected $auth;

	protected $socialite;

	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  Authenticator  $auth
	 * @return void
	 */
	public function __construct(Authenticator $auth, SocialiteFactory $socialite)
	{
		$this->auth = $auth;
		$this->socialite = $socialite;

		$this->middleware('csrf', ['on' => ['post']]);
		$this->middleware('guest', ['except' => ['getLogout']]);
	}

	/**
	 * Show the application registration form.
	 *
	 * @return Response
	 */
	public function getRegister()
	{
		return view('auth.register');
	}

	/**
	 * Handle a registration request for the application.
	 *
	 * @param  RegisterRequest  $request
	 * @return Response
	 */
	public function postRegister(RegisterRequest $request)
	{
		// Registration form is valid, create user...
		$user = User::create($request->all());

		$this->auth->login($user);

		return redirect('/');
	}

	/**
	 * Show the application login form.
	 *
	 * @return Response
	 */
	public function getLogin()
	{
		return view('auth.login');
	}

	/**
	 * Handle a login request to the application.
	 *
	 * @param  LoginRequest  $request
	 * @return Response
	 */
	public function postLogin(LoginRequest $request)
	{
		if ($this->auth->attempt($request->only('email', 'password')))
		{
			return redirect('/')->with('message', 'You are logged in.');
		}

		return redirect('/auth/login')->withErrors([
			'email' => 'The credentials you entered did not match our records. Try again?',
		]);
	}

	/**
	 * Log the user out of the application.
	 *
	 * @return Response
	 */
	public function getLogout()
	{
		$this->auth->logout();

		return redirect('/')->with('message', 'You are logged out.');
	}

	public function getLoginFacebook()
	{
		if(\Input::has('code'))
		{
			$user = $this->socialite->driver('facebook')->user();
			dd($user);
		}

		return $this->socialite->driver('facebook')->redirect();
	}

}
