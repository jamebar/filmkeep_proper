@extends('master_auth')

@section('content')
<div class="login-box">
  <h2>Filmkeep is currently invite only</h2>
  <p>If you have an invite code, please enter it below.</p>
  <hr>
    <form method="GET" action="{{ URL::to('/users/invite') }}" accept-charset="UTF-8">
      <input type="hidden" name="_token" value="{{{ Session::getToken() }}}">
      <fieldset>
      <div class="form-group">
        {{ Form::label('invite', 'Invite Code') }}
        {{ Form::text('invite','',['class'=>'form-control','placeholder'=>'Enter Invite Code']) }}
      </div>
     </fieldset>
      {{ Form::submit('Submit', ['class'=>'btn btn-primary']) }}
     
    {{ Form::close() }}

  <p>Already a member? <a href="{{ route('login') }}" target="_self">Sign in here</a></p>
</div>     
@stop