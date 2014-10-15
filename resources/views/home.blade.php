@extends('master')

@section('content')
<h1>Rate Movies. Love Film</h1>
@if(Auth::check())
<p>Welcome, {{Auth::user()->email}}<p>


@endif
<div ng-controller="addReviewCtrl" class="review-editor col-sm-6">
    <form><input name="title" placeholder="title of movie" ng-model="review.title"/></form>

    <relation-hint reviews="reviews" type="hint_index"></relation-hint>
    
    <div ng-repeat="rating_type in rating_types">
        <p>%%rating_type.label%%</p>
        <slider
            ng-model="rating_type.value"
            ng-init="rating_type.value = 1000"
            floor="1"
            ceiling="2000"
            step-width="1"
            show-steps="false"
            precision="1"
            stretch="1"
            ng-change="sliding()"
            ng-mousedown="setCurrent($index)"
            ng-mouseup="hideHint()"
            ng-class="{fadeSlider:fade_slider}"
            >
        </slider>
    </div>

    <textarea ng-model="review.notes"></textarea>
</div> 

@stop