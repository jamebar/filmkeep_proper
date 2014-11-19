@extends('master_auth')

@section('content')
  <h1>Login</h1>

  @if ($errors->any())
    <ul>
      @foreach ($errors->all() as $error)
        <li>{{$error}}</li>
      @endforeach
    </ul>
  @endif
            
            @if( isset( $code ) )
            <h3>Welcome to Filmkeep</h3>
            <p class="subheader">Thank you for accepting the invitation to see what we're all about. Choose your method of registration below to redeem your invite and start Filmkeeping.</p>
            @else
            <h3>Filmkeep is currently Invite Only</h3>
            <p class="subheader">If you have an invite code, register below and you'll be asked to enter your code on the next page.</p>
            @endif
            

            <div id="join-social">
                
                <h3>Join with social</h3>
                <p>To get the most out of Filmkeep, connect with your social media account.</p>
                <hr>
                 <p>
            </div>
           <hr>
            <div id="join-email">
                <h3>Join with email</h3>

                @foreach ($errors->all() as $message)
                
                <p>{{ $message }}</p>
                @endforeach

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

                        @if (Session::get('error'))
                            <div class="alert alert-error alert-danger">
                                @if (is_array(Session::get('error')))
                                    {{ head(Session::get('error')) }}
                                @endif
                            </div>
                        @endif

                        @if (Session::get('notice'))
                            <div class="alert">{{ Session::get('notice') }}</div>
                        @endif

                        <div class="form-actions form-group">
                          <button type="submit" class="btn btn-primary">{{{ Lang::get('confide::confide.signup.submit') }}}</button>
                        </div>

                    </fieldset>
                </form>


                <p>By creating an account, I accept Filmkeep's Terms of Service and Privacy Policy.</p>
                <p>Already a member? <a href="{{ route('login') }}" target="_self">Sign in here</a></p>
            </div> 
       
@stop
