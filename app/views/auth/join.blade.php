@extends('master_auth')

@section('content')
<div class="login-box">
  <h2>Join with social</h2>
  <p>To get the most out of Filmkeep, connect with your social media account.</p>
  <a href="/users/loginfacebook" target="_self" class="social-btn facebook "><i class="icon-social-facebook"></i> <span>Sign-up with Facebook</span></a>
  <a href="/users/logingoogle" target="_self" class="social-btn google "><i class="icon-social-google-plus"></i> <span>Sign-up with Google Plus</span></a>
  <hr>
  <h2>Join with email</h2>
  <form method="POST" action="{{{ URL::to('users') }}}" accept-charset="UTF-8">
      <input type="hidden" name="_token" value="{{{ Session::getToken() }}}">
      <fieldset>
          <div class="form-group">
              <label for="name">Name</label>
              <input class="form-control" placeholder="Name" type="text" name="name" id="name" value="{{{ Input::old('name') }}}">
          </div>
          
          <div class="form-group">
              <label for="email">{{{ Lang::get('confide::confide.e_mail') }}} </label>
              <input class="form-control" placeholder="{{{ Lang::get('confide::confide.e_mail') }}}" type="text" name="email" id="email" value="{{{ Input::old('email') }}}">
          </div>
          <div class="form-group">
              <label for="password">{{{ Lang::get('confide::confide.password') }}}</label>
              <input class="form-control" placeholder="{{{ Lang::get('confide::confide.password') }}}" type="password" name="password" id="password">
          </div>
          <div class="form-group">
              <label for="password_confirmation">{{{ Lang::get('confide::confide.password_confirmation') }}}</label>
              <input class="form-control" placeholder="{{{ Lang::get('confide::confide.password_confirmation') }}}" type="password" name="password_confirmation" id="password_confirmation">
          </div>

          

          <div class="form-actions form-group">
            <button type="submit" class="btn btn-primary">{{{ Lang::get('confide::confide.signup.submit') }}}</button>
          </div>

      </fieldset>
  </form>

                <p>By creating an account, I accept Filmkeep's <a href="/pages/terms-service" target="_self">Terms of Service</a> and <a target="_self" href="/pages/privacy">Privacy Policy</a>.</p>
                
                <p>Already a member? <a href="{{ route('login') }}" target="_self">Sign in here</a></p>
            
</div>     
@stop
