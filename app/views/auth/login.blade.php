@extends('master_auth')

@section('content')
	<h1>Login</h1>

	@if ($errors->any())
		<ul>
			@foreach ($errors->all() as $error)
				<li>{!!$error!!}</li>
			@endforeach
		</ul>
	@endif

	{!! Form::open() !!}

		{!!Form::label('email', 'Email')!!}
		{!!Form::email('email', null)!!}

		{!!Form::label('password', 'Password')!!}
		{!!Form::password('password')!!}

		{!!Form::submit('Login' ,['class'=>'button']) !!}

	{!! Form::close()!!}

	{!! link_to(route('loginFacebook'), 'Login with facebook') !!}
@stop