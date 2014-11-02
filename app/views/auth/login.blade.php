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
<h3>Member Sign-in</h3>
       
    <hr>
    <p><a class="button fb-btn medium-12 small-12" href="{{ route('facebooklogin') }}"><i class="fi-social-facebook"></i> Login with facebook</a>

    <a class="button google-btn medium-12 small-12" href="{{ route('googlelogin') }}"><i class="fi-social-google-plus"></i> Login with google</a></p>
    <hr>

    {{ Form::open(array('route'=>'login')) }}

    <!-- username field -->
    <p>
        
        {{ Form::text('email', '' , array('placeholder' => 'email' ) ) }}
    </p>

    <!-- password field -->
    <p>
        
        {{ Form::password('password',  array('placeholder' => 'password') ) }}
    </p>

    <!-- submit button -->
    <p>{{ Form::submit('Login', $attributes = array('class' => 'button small-12')) }}</p>

    {{ Form::close() }}
    <p> <a href="{{ route('password.remind') }}" class="">Forgot your password?</a></p>
    <p>Don't have an account yet? <a href="{{ route('join') }}" class="">Signup</a></p>
           
@stop