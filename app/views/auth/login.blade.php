@extends('master_auth')

@section('content')
<div class="login-box">
	
  <a href="/users/loginfacebook" target="_self" class="social-btn facebook "><span class="icon-social-facebook"></span> Sign in with Facebook</a>
  <hr>

   <form role="form" method="POST" action="{{{ URL::to('/users/login') }}}" accept-charset="UTF-8">
      <input type="hidden" name="_token" value="{{{ Session::getToken() }}}">
      <fieldset>
          <div class="form-group">
              <label for="email">{{{ Lang::get('confide::confide.username_e_mail') }}}</label>
              <input class="form-control" tabindex="1" placeholder="{{{ Lang::get('confide::confide.username_e_mail') }}}" type="text" name="email" id="email" value="{{{ Input::old('email') }}}">
          </div>
          <div class="form-group">
          <label for="password">
              {{{ Lang::get('confide::confide.password') }}}
          </label>
          <input class="form-control" tabindex="2" placeholder="{{{ Lang::get('confide::confide.password') }}}" type="password" name="password" id="password">
         
          </div>
          <div class="checkbox">
              <label for="remember">
                  <input type="hidden" name="remember" value="0">
                  <input tabindex="4" type="checkbox" name="remember" id="remember" value="1"> {{{ Lang::get('confide::confide.login.remember') }}}
              </label>
          </div>
          
          <div class="form-group">
              <button tabindex="3" type="submit" class="btn btn-primary">{{{ Lang::get('confide::confide.login.submit') }}}</button>
          </div>
      </fieldset>
  </form>

    <p> <a href="{{ route('password.remind') }}" target="_self" class="">Forgot your password?</a></p>
    <p>Don't have an account yet? <a href="{{ route('join') }}"  target="_self" class="">Signup</a></p>
</div>         
@stop