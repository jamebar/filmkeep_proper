@extends('master')

@section('content')
<h1>Rate Movies. Love Film</h1>
@if(Auth::check())
<p>Welcome, {{Auth::user()->email}}<p>


@endif


@stop