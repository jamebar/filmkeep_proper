@extends('master')

@section('content')
	<h1>Register</h1>

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

		{!!Form::label('password_confirmation', 'Password Confirmation')!!}
		{!!Form::password('password_confirmation')!!}

		{!!Form::submit('Register' ,['class'=>'button']) !!}
	{!! Form::close()!!}
@stop