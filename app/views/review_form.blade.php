<div ng-controller="addReviewCtrl" class="review-editor col-sm-6">
    <form ng-submit="reviewSubmit()">
        <div class="form-group">
            <input ng-disabled="review.id" type="text" class="form-control" placeholder="Add a review" options="typeaheadOptions" datasets="typeaheadData" ng-model="review.film" sf-typeahead>
        </div>
    
        <relation-hint ></relation-hint>
        
        <div ng-repeat="rating_type in rating_types track by $index" class="rating-type">
            <p>%%rating_type.label%% <span ng-show="rating_type.new">(New)</span></p>
            <slider
                ng-model="rating_type.value"
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

    <a ng-click="getReview(99)">get 99</a>

    <a ng-click="getReview(285)">get 285</a>
</div> 