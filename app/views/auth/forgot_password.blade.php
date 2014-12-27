@extends('master_auth')

@section('content')
<div class="login-box">
  <h2>Forgot your password?</h2>
  <p>Enter your email and we'll send you instructions</p>
  <form method="POST" action="{{ URL::to('/users/forgot_password') }}" accept-charset="UTF-8">
      <input type="hidden" name="_token" value="{{{ Session::getToken() }}}">
      <div class="form-group">
          <label for="email">{{{ Lang::get('confide::confide.e_mail') }}}</label>
              <input class="form-control" placeholder="{{{ Lang::get('confide::confide.e_mail') }}}" type="text" name="email" id="email" value="{{{ Input::old('email') }}}">
      </div>
      <div class="form-actions form-group">
          <input class="btn btn-primary" type="submit" value="{{{ Lang::get('confide::confide.forgot.submit') }}}">
      </div>
     
  </form>
</div>
@stop