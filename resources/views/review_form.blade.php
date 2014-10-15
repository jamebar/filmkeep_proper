<div ng-controller="addReviewCtrl" class="review-editor col-sm-6">
    <form>
        <div class="form-group">
            <input name="title" class="form-control" placeholder="title of movie" ng-model="review.title"/></form>
        </div>
    <relation-hint ></relation-hint>
    
    <div ng-repeat="rating_type in rating_types" class="rating-type">
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
    <div class="form-group">
        <textarea class="form-control" ng-model="review.notes"></textarea>
    </div>

    <button class="btn">Add Review</button>
</div> 