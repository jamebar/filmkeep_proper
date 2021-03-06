/*global _ */
/*global moment*/

'use strict';

var aeReview = angular.module('ae-review', [
    'Api',
    'ngAnimate',
    'ReviewService'
])


.controller('addReviewCtrl', ['$q', '$scope', 'msgBus', 'ReviewService',
    function($q, $scope, msgBus, ReviewService) {

    }
])
.directive('addEditReview', ['$rootScope','$filter','$document','$modal','$compile','$timeout', 'msgBus','ReviewService','AlertService',
    function($rootScope,$filter,$document,$modal,$compile,$timeout,msgBus, ReviewService,AlertService){
        return {
            restrict: 'E',
            scope:{
                review : '=',
                rating_types: '=ratingTypes'
            },
            templateUrl: '/assets/templates/add_review.tmpl.html',
            link: function(scope, element, attrs) {

                scope.hint_index = 0;
                var sortedReviews = [];
                var currentSlider;
                var sliderTimeout;
                scope.show_hint = false;
                scope.left = "";
                scope.right = "";
                scope.loader = false;
                // scope.relation_top = window.event.clientY;
                scope.ae_button_label = scope.review.id ? "Update" : "Add";
                
                
                ReviewService.getReviews().then(function(results){
                        scope.reviews = results;
                    })

                scope.reviewSubmit = function() {
                    var ratings = [];
                    _.forEach(scope.rating_types, function(val){
                        var rt = {
                            rating_type_id: val.id,
                            value:val.value
                        }
                        ratings.push(rt);
                    });

                    scope.review.ratings = ratings;

                    if(scope.review.id)
                    {
                      scope.loader = true;
                      scope.review.$update({review_id:scope.review.id}).then(function(){
                        scope.loader = false;
                        $rootScope.$broadcast('modal::close');
                        $rootScope.$broadcast('review::updated', scope.review);
                        AlertService.Notice("Your review of '" + scope.review.film.title + "' has been updated");
                      });
                    }
                    else
                    {
                      if(angular.isDefined(scope.review.film) && angular.isDefined(scope.review.film.tmdb_id))
                      {
                        scope.loader = true;
                        scope.review.$save().then(function(){
                          scope.loader = false;
                          $rootScope.$broadcast('modal::close');
                          msgBus.emitMsg('review::added', scope.review);
                          AlertService.Notice("Your review of '" + scope.review.film.title + "' has been created");
                        });
                      }
                      else{
                        AlertService.Alert("Whoops, you must choose a film before saving.");
                      }
                    }
                      
                    // var newReview = new reviewApiService();
                    // newReview
                    // scope.review = new reviewApiService();
                }

                msgBus.onMsg('criteria::added', function(e, data){
                  scope.rating_types.push(data);
                });

                scope.sliding = function(el) {
                    
                    if(currentSlider != el)
                    {
                      scope.setCurrent(el);
                      currentSlider = el;
                    } 
                    inBetween();

                }

                scope.$on('slider::start', function(e){
                    scope.fade_slider = true;
                    scope.show_hint = true;
                });

                scope.$on('slider::end', function(e){
                    scope.hideHint();
                    scope.$apply();
                });

                scope.setCurrent = function(el) {
                    scope.hint_index = el.element ? (el.element.context.id *1) : el;

                    sortedReviews = _.sortBy(scope.reviews, function(r) {
                        return r.ratings[scope.hint_index] ? r.ratings[scope.hint_index].value : 0;
                    })
                    scope.relation_top = $('#slider-'+ el).offset().top + $('.modal').scrollTop() - $(window).scrollTop() - 75;
                    inBetween();
                    
                    scope.fade_slider = true;
                    scope.show_hint = true;
                }

                scope.hideHint = function() {
                    scope.fade_slider = false;
                    scope.show_hint = false;
                }

                function getOffsetTop( elem )
                {
                    var offsetTop = 0;
                    do {
                      if ( !isNaN( elem.offsetTop ) )
                      {
                          offsetLeft += elem.offsetTop;
                      }
                    } while( elem = elem.offsetParent );
                    return offsetTop;
                }

                function inBetween() {
                    

                   
                    scope.curValue = scope.rating_types[scope.hint_index].value;
                    var r = sortedReviews;
                    for (var i = 0; i < r.length; i++) {
                        
                        //skip everything if this rating doesn't exist
                        if( r[i].ratings[scope.hint_index] === undefined)
                        {
                            scope.right_compare = '';
                            scope.left_compare = '';
                            continue;
                        }
                            

                        var next_val = i + 1;
                        if (next_val > r.length - 1) next_val = r.length - 1;

                        if (scope.curValue >= r[i].ratings[scope.hint_index].value && scope.curValue <= r[next_val].ratings[scope.hint_index].value) {
                            scope.left_compare = r[i].film.title
                            scope.right_compare = r[next_val].film.title;
                        }

                        //check if last
                        if (scope.curValue > r[r.length - 1].ratings[scope.hint_index].value) {
                            scope.left_compare = r[r.length - 1].film.title;
                            scope.right_compare = '';
                        }

                        //check if first
                        if ( angular.isDefined(r[0].ratings[scope.hint_index]) && scope.curValue < r[0].ratings[scope.hint_index].value) {
                            scope.left_compare = '';
                            scope.right_compare = r[0].film.title;
                        }
                    }
                }

                // Instantiate the bloodhound suggestion engine
                var films = new Bloodhound({
                    datumTokenizer: function(d) {
                        return Bloodhound.tokenizers.whitespace(title);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/api/tmdb/%QUERY',
                        filter: function(list) {
                            return $.map(list.results, function(data) {
                                data.release_date  = data.release_date || 'N/A';
                                return {
                                    title: data.title,
                                    tmdb_id: data.id,
                                    release_date: data.release_date.substring(0, 4),
                                    poster: $filter('imageFilter')(data.poster_path,'poster',0)
                                };
                            });
                        }
                    }
                });

                films.initialize();

                scope.typeaheadOptions = {
                    hint: true,
                    highlight: true,
                    minLength: 1,
                };

                scope.typeaheadData = {
                    name: 'films',
                    displayKey: 'title',
                    source: films.ttAdapter(),
                    templates: {
                      suggestion: function (context) {
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" onerror="if (this.src != \'/assets/img/fallback-poster.jpg\') this.src = \'/assets/img/fallback-poster.jpg\';"/></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
                      }
                    }
                };

                scope.$on('typeahead:selected', function(a, b) {
                })

            }
        }
    }
])

.directive('relationHint', ['$compile', '$timeout',
    function($compile, $timeout) {
        return {
            restrict: 'E',
            templateUrl: '/assets/templates/relation_hint.tmpl.html',
            link: function(scope, element, attrs) {


            }
        }
    }
])
