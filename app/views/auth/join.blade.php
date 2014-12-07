@extends('master_auth')

@section('content')
<div class="login-box">
  <h1>Join</h1>



                <form method="POST" action="{{{ URL::to('users') }}}" accept-charset="UTF-8">
                    <input type="hidden" name="_token" value="{{{ Session::getToken() }}}">
                    <fieldset>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input class="form-control" placeholder="Name" type="text" name="name" id="name" value="{{{ Input::old('name') }}}">
                        </div>
                        
                        <div class="form-group">
                            <label for="email">{{{ Lang::get('confide::confide.e_mail') }}} <small>{{ Lang::get('confide::confide.signup.confirmation_required') }}</small></label>
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

                        <p>By creating an account, I accept Filmkeep's Terms of Service and Privacy Policy.</p>

                        <div class="form-actions form-group">
                          <button type="submit" class="btn btn-primary">{{{ Lang::get('confide::confide.signup.submit') }}}</button>
                        </div>

                    </fieldset>
                </form>


                
                <p>Already a member? <a href="{{ route('login') }}" target="_self">Sign in here</a></p>
            
</div>     
@stop
