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
                 <p><a class="button fb-btn  small-12" target="_self" href="{{ route('facebooklogin') }}"><i class="fi-social-facebook"></i> Join with facebook</a>
                 <a class="button google-btn  small-12" target="_self" href="{{ route('googlelogin') }}"><i class="fi-social-google-plus"></i> Join with google</a></p>
                 
            </div>
           <hr>
            <div id="join-email">
                <h3>Join with email</h3>

                @foreach ($errors->all() as $message)
                
                <p>{{ $message }}</p>
                @endforeach

                {{ Form::open(array('route'=>'join')) }}

                <!-- fullname field -->
                <p>
                    
                    {{ Form::text('fullname', '' , array('placeholder' => 'First and last name') ) }}
                </p>

                <!-- email field -->
                <p>
                    
                    {{ Form::text('email', '' , array('placeholder' => 'Email') ) }}
                </p>

                <!-- password field -->
                <p>
                    
                    {{ Form::password('password',  array('placeholder' => 'password')) }}
                </p>

                <!-- submit button -->
                <p>{{ Form::submit('Create Account', $attributes = array('class' => 'button small-12')) }}</p>

                {{ Form::close() }}

                <p>By creating an account, I accept Filmkeep's Terms of Service and Privacy Policy.</p>
                <p>Already a member? <a href="{{ route('login') }}" target="_self">Sign in here</a></p>
              </div> 
       
@stop
