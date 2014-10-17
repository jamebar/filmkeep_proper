<div ng-controller="addReviewCtrl" class="review-editor col-sm-6">
    <form>
        <div class="form-group">
            <input type="text" class="form-control" placeholder="Add a review" options="typeaheadOptions" datasets="typeaheadData" ng-model="review.title" sf-typeahead>
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

        <input type="submit" class="btn btn-primary" value="Add Review">
    </form>
</div> 